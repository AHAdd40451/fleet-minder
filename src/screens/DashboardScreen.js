import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [companyData, setCompanyData] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = async () => {
    try {
      // Get the phone number from AsyncStorage or use a default approach
      const storedPhone = await AsyncStorage.getItem('userPhone');
      
      if (!storedPhone) {
        // If no stored phone, try to get the latest user data
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (userError) throw userError;
        
        if (users && users.length > 0) {
          const user = users[0];
          setUserData(user);
          
          // Fetch company data
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', user.company_id)
            .single();
          
          if (companyError) throw companyError;
          setCompanyData(company);
          
          // Fetch vehicle data
          const { data: vehicles, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('company_id', user.company_id);
          
          if (vehicleError) throw vehicleError;
          setVehicleData(vehicles && vehicles.length > 0 ? vehicles[0] : null);
        }
      } else {
        // Use stored phone to fetch data
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('phone', storedPhone)
          .single();
        
        if (userError) throw userError;
        setUserData(users);
        
        // Fetch company data
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', users.company_id)
          .single();
        
        if (companyError) throw companyError;
        setCompanyData(company);
        
        // Fetch vehicle data
        const { data: vehicles, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('company_id', users.company_id);
        
        if (vehicleError) throw vehicleError;
        setVehicleData(vehicles && vehicles.length > 0 ? vehicles[0] : null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('isOnboardingComplete');
              await AsyncStorage.removeItem('userPhone');
              navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Fleet Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Company Information Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconContainer}>
            <Text style={styles.cardIcon}>🏢</Text>
          </View>
          <Text style={styles.cardTitle}>Company Information</Text>
        </View>
        {companyData ? (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>📋</Text>
                <Text style={styles.label}>Company Name</Text>
              </View>
              <Text style={styles.value}>{companyData.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>📞</Text>
                <Text style={styles.label}>Phone</Text>
              </View>
              <Text style={styles.value}>{companyData.phone || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>🌍</Text>
                <Text style={styles.label}>Country</Text>
              </View>
              <Text style={styles.value}>{companyData.country || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.label}>State</Text>
              </View>
              <Text style={styles.value}>{companyData.state || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={styles.label}>Created</Text>
              </View>
              <Text style={styles.value}>{formatDate(companyData.created_at)}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataIcon}>📭</Text>
            <Text style={styles.noDataText}>No company data available</Text>
          </View>
        )}
      </View>

      {/* Vehicle Information Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconContainer}>
            <Text style={styles.cardIcon}>🚗</Text>
          </View>
          <Text style={styles.cardTitle}>Vehicle Information</Text>
        </View>
        {vehicleData ? (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>🔢</Text>
                <Text style={styles.label}>VIN</Text>
              </View>
              <Text style={styles.value}>{vehicleData.vin || 'N/A'}</Text>
            </View>
            {/* Vehicle details - only show if columns exist */}
            {vehicleData.make && (
              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Text style={styles.infoIcon}>🏭</Text>
                  <Text style={styles.label}>Make</Text>
                </View>
                <Text style={styles.value}>{vehicleData.make || 'N/A'}</Text>
              </View>
            )}
            {vehicleData.model && (
              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Text style={styles.infoIcon}>🚙</Text>
                  <Text style={styles.label}>Model</Text>
                </View>
                <Text style={styles.value}>{vehicleData.model || 'N/A'}</Text>
              </View>
            )}
            {vehicleData.year && (
              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Text style={styles.infoIcon}>📅</Text>
                  <Text style={styles.label}>Year</Text>
                </View>
                <Text style={styles.value}>{vehicleData.year || 'N/A'}</Text>
              </View>
            )}
            {vehicleData.mileage && (
              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Text style={styles.infoIcon}>🛣️</Text>
                  <Text style={styles.label}>Mileage</Text>
                </View>
                <Text style={styles.value}>{vehicleData.mileage || 'N/A'}</Text>
              </View>
            )}
            {vehicleData.odometer && (
              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Text style={styles.infoIcon}>📊</Text>
                  <Text style={styles.label}>Odometer</Text>
                </View>
                <Text style={styles.value}>{vehicleData.odometer || 'N/A'}</Text>
              </View>
            )}
            {vehicleData.color && (
              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Text style={styles.infoIcon}>🎨</Text>
                  <Text style={styles.label}>Color</Text>
                </View>
                <Text style={styles.value}>{vehicleData.color || 'N/A'}</Text>
              </View>
            )}
            {vehicleData.image_url && (
              <View style={styles.imageContainer}>
                <View style={styles.infoLabelContainer}>
                  <Text style={styles.infoIcon}>📸</Text>
                  <Text style={styles.label}>Vehicle Image</Text>
                </View>
                <Image source={{ uri: vehicleData.image_url }} style={styles.vehicleImage} />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataIcon}>🚫</Text>
            <Text style={styles.noDataText}>No vehicle data available</Text>
          </View>
        )}
      </View>

      {/* User Status Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconContainer}>
            <Text style={styles.cardIcon}>👤</Text>
          </View>
          <Text style={styles.cardTitle}>Account Status</Text>
        </View>
        {userData ? (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>✅</Text>
                <Text style={styles.label}>Phone Verified</Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: userData.verified ? '#00E676' : '#FF6B35' }
                ]}>
                  <Text style={styles.statusText}>
                    {userData.verified ? '✓ Verified' : '⏳ Pending'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>📝</Text>
                <Text style={styles.label}>Onboarding</Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: userData.is_onboarding_complete ? '#00E676' : '#FF6B35' }
                ]}>
                  <Text style={styles.statusText}>
                    {userData.is_onboarding_complete ? '✓ Complete' : '⏳ Incomplete'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={styles.label}>Account Created</Text>
              </View>
              <Text style={styles.value}>{formatDate(userData.created_at)}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataIcon}>👤</Text>
            <Text style={styles.noDataText}>No user data available</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Onboarding')}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>✏️</Text>
            <Text style={styles.actionButtonText}>Edit Information</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={onRefresh}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>🔄</Text>
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Refresh Data</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 15,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    backdropFilter: 'blur(20px)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
    flex: 1,
  },
  infoContainer: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  label: {
    color: '#b0b0b0',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  statusContainer: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 10,
    opacity: 0.6,
  },
  noDataText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  imageContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  vehicleImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 10,
  },
  actionsContainer: {
    padding: 20,
    gap: 16,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  actionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: '#fff',
  },
});

export default DashboardScreen;
