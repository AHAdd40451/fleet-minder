import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import { canAccessSettings, isOwner, isAdminOrOwner, canAccessSection, getRoleDisplayName } from '../utils/rbac';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccessAndFetchData();
  }, []);

  const checkAccessAndFetchData = async () => {
    try {
      setLoading(true);
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', storedUserId)
          .single();

        if (error) throw error;
        setUserData(user);

        // Check if user has access to Settings
        const access = canAccessSettings(user.role);
        setHasAccess(access);

        if (!access) {
          // User doesn't have access, immediately redirect without showing screen
          setLoading(false);
          Alert.alert(
            'Access Denied',
            'You do not have permission to access Settings. Only Owners and Administrators can access this page.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate back immediately
                  const parent = navigation.getParent();
                  if (parent) {
                    parent.goBack();
                  } else {
                    navigation.goBack();
                  }
                },
              },
            ]
          );
          return; // Exit early to prevent rendering
        }
      } else {
        // No user ID, redirect to sign in
        setLoading(false);
        navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
        return;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load user data');
      navigation.goBack();
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('isOnboardingComplete');
            await AsyncStorage.removeItem('userPhone');
            await AsyncStorage.removeItem('userId');
            navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const storedUserId = await AsyncStorage.getItem('userId');
              
              if (storedUserId) {
                // Delete user data from Supabase
                const { error } = await supabase
                  .from('users')
                  .delete()
                  .eq('id', storedUserId);

                if (error) throw error;
              }

              // Clear all stored data
              await AsyncStorage.clear();

              Alert.alert('Success', 'Account deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
                  },
                },
              ]);
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, showArrow = true, disabled = false, requiredRole = null }) => {
    // Check if user has required role for this item
    const hasRequiredRole = requiredRole ? canAccessSection(userData?.role, requiredRole) : true;
    const isDisabled = disabled || !hasRequiredRole;

    if (requiredRole && !hasRequiredRole) {
      return null; // Hide item if user doesn't have required role
    }

    return (
      <TouchableOpacity
        style={[styles.settingItem, isDisabled && styles.settingItemDisabled]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={isDisabled ? 1 : 0.7}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.iconContainer, isDisabled && styles.iconContainerDisabled]}>
            <Ionicons name={icon} size={22} color={isDisabled ? "#666" : "#fff"} />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, isDisabled && styles.settingTitleDisabled]}>{title}</Text>
            {subtitle && <Text style={[styles.settingSubtitle, isDisabled && styles.settingSubtitleDisabled]}>{subtitle}</Text>}
          </View>
        </View>
        <View style={styles.settingRight}>
          {rightComponent}
          {showArrow && onPress && !isDisabled && (
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 8 }} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const SettingSection = ({ title, children, requiredRole = null }) => {
    // Check if user has required role for this section
    if (requiredRole && !canAccessSection(userData?.role, requiredRole)) {
      return null; // Hide entire section if user doesn't have required role
    }

    return (
      <View style={styles.section}>
        {title && <Text style={styles.sectionTitle}>{title}</Text>}
        <View style={styles.sectionContent}>{children}</View>
      </View>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  // Show access denied message
  if (!hasAccess) {
    return (
      <View style={[styles.container, styles.accessDeniedContainer]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.accessDeniedContent}>
          <Ionicons name="lock-closed" size={64} color="#FF6B35" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You do not have permission to access Settings.{'\n'}
            Only Owners and Administrators can access this page.
          </Text>
          <Text style={styles.accessDeniedRole}>
            Your Role: {getRoleDisplayName(userData?.role)}
          </Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="white"
            style={{ marginTop: 20, minWidth: 150 }}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Account Section */}
      <SettingSection title="Account">
        <View style={styles.card}>
          {userData && (
            <View style={styles.accountInfo}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={32} color="#fff" />
              </View>
              <View style={styles.accountDetails}>
                <Text style={styles.accountName}>
                  {userData.phone || 'User'}
                </Text>
                <Text style={styles.accountEmail}>
                  {userData.verified ? '✓ Verified' : 'Pending Verification'}
                </Text>
                <Text style={styles.accountRole}>
                  Role: {getRoleDisplayName(userData.role)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </SettingSection>

      {/* Company Management Section - Only for Owner/Admin */}
      <SettingSection title="Company Management" requiredRole="company">
        <View style={styles.card}>
          <SettingItem
            icon="business-outline"
            title="Company Settings"
            subtitle="Manage company information"
            onPress={() => Alert.alert('Company Settings', 'Company management features coming soon!')}
            requiredRole="company"
          />
          <View style={styles.divider} />
          <SettingItem
            icon="people-outline"
            title="User Management"
            subtitle="Manage users and permissions"
            onPress={() => Alert.alert('User Management', 'User management features coming soon!')}
            requiredRole="users"
          />
          <View style={styles.divider} />
          <SettingItem
            icon="card-outline"
            title="Billing & Subscription"
            subtitle="Manage billing and subscription"
            onPress={() => Alert.alert('Billing', 'Billing management features coming soon!')}
            requiredRole="billing"
          />
        </View>
      </SettingSection>

      {/* Fleet Management Section - Owner/Admin/Manager */}
      <SettingSection title="Fleet Management" requiredRole="vehicles">
        <View style={styles.card}>
          <SettingItem
            icon="car-outline"
            title="Vehicle Settings"
            subtitle="Configure vehicle defaults"
            onPress={() => Alert.alert('Vehicle Settings', 'Vehicle configuration features coming soon!')}
            requiredRole="vehicles"
          />
          <View style={styles.divider} />
          <SettingItem
            icon="map-outline"
            title="Fleet Operations"
            subtitle="Manage fleet operations"
            onPress={() => Alert.alert('Fleet Operations', 'Fleet operations features coming soon!')}
            requiredRole="fleet"
          />
        </View>
      </SettingSection>

      {/* Preferences Section - Available to all roles */}
      <SettingSection title="Preferences">
        <View style={styles.card}>
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Receive push notifications"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: '#8B5CF6' }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
              />
            }
            showArrow={false}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Use dark theme"
            rightComponent={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: '#767577', true: '#8B5CF6' }}
                thumbColor={darkModeEnabled ? '#fff' : '#f4f3f4'}
              />
            }
            showArrow={false}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="sync-outline"
            title="Auto Sync"
            subtitle="Automatically sync data"
            rightComponent={
              <Switch
                value={autoSyncEnabled}
                onValueChange={setAutoSyncEnabled}
                trackColor={{ false: '#767577', true: '#8B5CF6' }}
                thumbColor={autoSyncEnabled ? '#fff' : '#f4f3f4'}
              />
            }
            showArrow={false}
          />
        </View>
      </SettingSection>

      {/* General Section */}
      <SettingSection title="General">
        <View style={styles.card}>
          <SettingItem
            icon="information-circle-outline"
            title="About"
            subtitle="App version and information"
            onPress={() => Alert.alert('About', 'Fleet Minder v1.0.0\n\nManage your fleet with ease.')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => Alert.alert('Help & Support', 'For support, please contact us at support@fleetminder.com')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy content goes here.')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="document-text-outline"
            title="Terms of Service"
            subtitle="Read our terms of service"
            onPress={() => Alert.alert('Terms of Service', 'Terms of service content goes here.')}
          />
        </View>
      </SettingSection>

      {/* Danger Zone */}
      <SettingSection title="Danger Zone">
        <View style={styles.card}>
          <SettingItem
            icon="log-out-outline"
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            showArrow={true}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={handleDeleteAccount}
            showArrow={true}
          />
        </View>
      </SettingSection>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Fleet Minder v1.0.0</Text>
        <Text style={styles.footerText}>© 2024 All rights reserved</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 5,
  },
  sectionContent: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 60,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 68,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    color: '#888',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 50,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  accessDeniedContainer: {
    flex: 1,
  },
  accessDeniedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 12,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#b0b0b0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  accessDeniedRole: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  accountRole: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 4,
    fontWeight: '600',
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  iconContainerDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingTitleDisabled: {
    color: '#666',
  },
  settingSubtitleDisabled: {
    color: '#555',
  },
});

export default SettingsScreen;

