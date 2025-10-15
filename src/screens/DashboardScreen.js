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
  ActivityIndicator 
} from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        <Text style={styles.cardTitle}>Company Information</Text>
        {companyData ? (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Company Name:</Text>
              <Text style={styles.value}>{companyData.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{companyData.phone || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Country:</Text>
              <Text style={styles.value}>{companyData.country || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>State:</Text>
              <Text style={styles.value}>{companyData.state || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Created:</Text>
              <Text style={styles.value}>{formatDate(companyData.created_at)}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>No company data available</Text>
        )}
      </View>

      {/* Vehicle Information Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vehicle Information</Text>
        {vehicleData ? (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>VIN:</Text>
              <Text style={styles.value}>{vehicleData.vin || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Make:</Text>
              <Text style={styles.value}>{vehicleData.make || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Model:</Text>
              <Text style={styles.value}>{vehicleData.model || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Year:</Text>
              <Text style={styles.value}>{vehicleData.year || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Mileage:</Text>
              <Text style={styles.value}>{vehicleData.mileage || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Odometer:</Text>
              <Text style={styles.value}>{vehicleData.odometer || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Color:</Text>
              <Text style={styles.value}>{vehicleData.color || 'N/A'}</Text>
            </View>
            {vehicleData.image_url && (
              <View style={styles.imageContainer}>
                <Text style={styles.label}>Vehicle Image:</Text>
                <Image source={{ uri: vehicleData.image_url }} style={styles.vehicleImage} />
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.noDataText}>No vehicle data available</Text>
        )}
      </View>

      {/* User Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Status</Text>
        {userData ? (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone Verified:</Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: userData.verified ? '#4CAF50' : '#FF9800' }
                ]}>
                  <Text style={styles.statusText}>
                    {userData.verified ? 'Verified' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Onboarding Complete:</Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: userData.is_onboarding_complete ? '#4CAF50' : '#FF9800' }
                ]}>
                  <Text style={styles.statusText}>
                    {userData.is_onboarding_complete ? 'Complete' : 'Incomplete'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Account Created:</Text>
              <Text style={styles.value}>{formatDate(userData.created_at)}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>No user data available</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Onboarding')}
        >
          <Text style={styles.actionButtonText}>Edit Information</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={onRefresh}
        >
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Refresh Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#111',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 10,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  label: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    flex: 2,
    textAlign: 'right',
  },
  statusContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noDataText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  imageContainer: {
    marginTop: 10,
  },
  vehicleImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  actionsContainer: {
    padding: 20,
    gap: 15,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  secondaryButtonText: {
    color: '#fff',
  },
});

export default DashboardScreen;
