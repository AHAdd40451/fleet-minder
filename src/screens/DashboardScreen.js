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
  Dimensions,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import Button from '../components/Button';
import { FleetLoadingAnimation, NotifyMessage, SweetBox } from '../components';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import Tesseract from "tesseract.js";
import { validateVIN, validateYear, validateNumeric, validateRequired } from '../utils/validation';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [companyData, setCompanyData] = useState(null);
  const [vehiclesData, setVehiclesData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addVehicleModalVisible, setAddVehicleModalVisible] = useState(false);
  const [editVehicleModalVisible, setEditVehicleModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editCompanyModalVisible, setEditCompanyModalVisible] = useState(false);
  const [editCompanyFormData, setEditCompanyFormData] = useState({
    name: '',
    country: '',
    state: ''
  });
  const [editCompanyLoading, setEditCompanyLoading] = useState(false);
  const [vehicleFormData, setVehicleFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: '',
    mileage: '',
    odometer: '',
    color: '',
    asset_name: ''
  });
  const [vehicleFormErrors, setVehicleFormErrors] = useState({});
  const [vehicleFormLoading, setVehicleFormLoading] = useState(false);
  const [vehicleFormSaving, setVehicleFormSaving] = useState(false);
  const [vinImages, setVinImages] = useState([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [meterImages, setMeterImages] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUserData = async () => {
    try {
      // Get stored user_id and phone from AsyncStorage
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedPhone = await AsyncStorage.getItem('userPhone');
      
      if (storedUserId) {
        // Use stored user_id for direct data fetching
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', storedUserId)
          .single();
        
        if (userError) throw userError;
        setUserData(user);
        
        // Fetch company data using user_id - get the most recent one
        const { data: companies, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', storedUserId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (companyError) throw companyError;
        setCompanyData(companies && companies.length > 0 ? companies[0] : null);
        
        // Fetch all vehicles data using user_id
        const { data: vehicles, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', storedUserId)
          .order('created_at', { ascending: false });
        
        if (vehicleError) throw vehicleError;
        setVehiclesData(vehicles || []);
      } else if (storedPhone) {
        // Fallback: Use stored phone to fetch data
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('phone', storedPhone)
          .single();
        
        if (userError) throw userError;
        setUserData(users);
        
        // Fetch company data using user_id - get the most recent one
        const { data: companies, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', users.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (companyError) throw companyError;
        setCompanyData(companies && companies.length > 0 ? companies[0] : null);
        
        // Fetch all vehicles data using user_id
        const { data: vehicles, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', users.id)
          .order('created_at', { ascending: false });
        
        if (vehicleError) throw vehicleError;
        setVehiclesData(vehicles || []);
      } else {
        // Last resort: Get the latest user data
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (userError) throw userError;
        
        if (users && users.length > 0) {
          const user = users[0];
          setUserData(user);
          
          // Fetch company data using user_id - get the most recent one
          const { data: companies, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (companyError) throw companyError;
          setCompanyData(companies && companies.length > 0 ? companies[0] : null);
          
          // Fetch all vehicles data using user_id
          const { data: vehicles, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (vehicleError) throw vehicleError;
          setVehiclesData(vehicles || []);
        }
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
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      // Check if user is authenticated
      const userId = await AsyncStorage.getItem('userId');
      const isOnboardingComplete = await AsyncStorage.getItem('isOnboardingComplete');
      
      if (!userId || isOnboardingComplete !== 'true') {
        // User is not properly authenticated or onboarding not complete
        // Clear any stale data and redirect to appropriate screen
        await AsyncStorage.removeItem('isOnboardingComplete');
        await AsyncStorage.removeItem('userPhone');
        await AsyncStorage.removeItem('userId');
        
        if (isOnboardingComplete === 'false') {
          navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
        }
        return;
      }
      
      // User is authenticated, fetch data
      await fetchUserData();
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, redirect to sign in
      navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  const openEditCompanyModal = () => {
    if (companyData) {
      setEditCompanyFormData({
        name: companyData.name || '',
        country: companyData.country || '',
        state: companyData.state || ''
      });
      setEditCompanyModalVisible(true);
    }
  };

  const closeEditCompanyModal = () => {
    setEditCompanyModalVisible(false);
    setEditCompanyFormData({
      name: '',
      country: '',
      state: ''
    });
  };

  const handleEditCompanySave = async () => {
    if (!editCompanyFormData.name.trim() || !editCompanyFormData.country.trim() || !editCompanyFormData.state.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    try {
      setEditCompanyLoading(true);
      
      const storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) {
        Alert.alert('Error', 'User not found. Please sign in again.');
        return;
      }

      const { error } = await supabase
        .from('companies')
        .upsert({
          id: companyData.id, // Include company ID to update existing record
          user_id: storedUserId,
          name: editCompanyFormData.name.trim(),
          country: editCompanyFormData.country.trim(),
          state: editCompanyFormData.state.trim()
        });

      if (error) throw error;

      // Update local state
      setCompanyData(prev => ({
        ...prev,
        name: editCompanyFormData.name.trim(),
        country: editCompanyFormData.country.trim(),
        state: editCompanyFormData.state.trim()
      }));

      closeEditCompanyModal();
      Alert.alert('Success', 'Company information updated successfully!');
    } catch (error) {
      console.error('Error updating company:', error);
      Alert.alert('Error', 'Failed to update company information. Please try again.');
    } finally {
      setEditCompanyLoading(false);
    }
  };

  const openAddVehicleModal = () => {
    setVehicleFormData({
      vin: '',
      make: '',
      model: '',
      year: '',
      mileage: '',
      odometer: '',
      color: '',
      asset_name: ''
    });
    setVehicleFormErrors({});
    setVinImages([]);
    setMeterImages([]);
    setAddVehicleModalVisible(true);
  };

  const closeAddVehicleModal = () => {
    setAddVehicleModalVisible(false);
    setVehicleFormData({
      vin: '',
      make: '',
      model: '',
      year: '',
      mileage: '',
      odometer: '',
      color: '',
      asset_name: ''
    });
    setVehicleFormErrors({});
    setVinImages([]);
    setMeterImages([]);
  };

  const openEditVehicleModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleFormData({
      vin: vehicle.vin || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year ? vehicle.year.toString() : '',
      mileage: vehicle.mileage ? vehicle.mileage.toString() : '',
      odometer: vehicle.odometer ? vehicle.odometer.toString() : '',
      color: vehicle.color || '',
      asset_name: vehicle.asset_name || ''
    });
    setVehicleFormErrors({});
    setVinImages([]);
    setMeterImages([]);
    setEditVehicleModalVisible(true);
  };

  const closeEditVehicleModal = () => {
    setEditVehicleModalVisible(false);
    setEditingVehicle(null);
    setVehicleFormData({
      vin: '',
      make: '',
      model: '',
      year: '',
      mileage: '',
      odometer: '',
      color: '',
      asset_name: ''
    });
    setVehicleFormErrors({});
    setVinImages([]);
    setMeterImages([]);
  };

  const deleteVehicle = async (vehicleId) => {
    try { 
      setIsDeleting(true);

      const { error } = await supabase
        .from("vehicles") // your table name
        .delete()
        .eq("id", vehicleId);

      if (error) {
        console.error("Error deleting vehicle:", error.message);
        alert("Failed to delete vehicle");
        return;
      }

      // alert("Vehicle deleted successfully");
      setShowDeleteAlert(true);
      onDeleted?.(vehicleId); // refresh parent list if needed
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const pickImages = async (setter, type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setter(prev => [...prev, ...newImages]);
        
        // Process the first image for OCR if it's a new image
        if (newImages.length > 0) {
          const firstImage = newImages[0];
          if (type === "vin") {
            await extractVin(firstImage);
          } else if (type === "meter") {
            await extractOdometer(firstImage);
          }
        }
      }
    } catch (err) {
      console.error("Error picking images:", err);
      Alert.alert("Error", "Failed to open image library");
    }
  };

  const removeImage = (imageUri, setter) => {
    setter(prev => prev.filter(uri => uri !== imageUri));
  };

  const getBase64 = async (imageUri) => {
    if (Platform.OS === "web") {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onerror = reject;
        reader.onload = () => {
          const dataUrl = reader.result;
          const base64 = dataUrl.split(",")[1];
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });
    } else {
      return await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64",
      });
    }
  };

  const extractVin = async (imageUri) => {
    try {
      setVehicleFormLoading(true);
      const b64 = await getBase64(imageUri);
      const buffer = `data:image/jpeg;base64,${b64}`;

      const { data: { text } } = await Tesseract.recognize(buffer, "eng", {
        logger: (m) => console.log("VIN OCR:", m),
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        psm: Tesseract.PSM.SINGLE_LINE,
      });

      console.log("VIN OCR raw:", text);

      const clean = text.replace(/\s+/g, "").toUpperCase();
      const vinMatch = clean.match(/[A-HJ-NPR-Z0-9]{17}/);
      if (vinMatch && vinMatch[0].length === 17) {
        const detected = vinMatch[0];
        setVehicleFormData(prev => ({ ...prev, vin: detected }));
        Alert.alert("VIN Detected", detected);
      }

      const yearMatch = text.match(/20\d{2}|19\d{2}/);
      if (yearMatch) setVehicleFormData(prev => ({ ...prev, year: yearMatch[0] }));

      const makeMatch = text.match(
        /(TOYOTA|HONDA|FORD|CHEVROLET|BMW|NISSAN|TESLA|MERCEDES|HYUNDAI|KIA|VOLKSWAGEN|JEEP|DODGE)/i
      );
      if (makeMatch) setVehicleFormData(prev => ({ ...prev, make: makeMatch[0].toUpperCase() }));

      const modelMatch = text.match(
        /(CIVIC|COROLLA|CAMRY|F150|MODEL\s?3|ACCORD|ALTIMA|SONATA|TUCSON|GOLF|CHARGER|WRANGLER)/i
      );
      if (modelMatch) setVehicleFormData(prev => ({ ...prev, model: modelMatch[0].toUpperCase() }));
    } catch (err) {
      console.error("Error in extractVin:", err);
      Alert.alert("Error", "Could not read VIN");
    } finally {
      setVehicleFormLoading(false);
    }
  };

  const extractOdometer = async (imageUri) => {
    try {
      setVehicleFormLoading(true);
      const b64 = await getBase64(imageUri);
      const buffer = `data:image/jpeg;base64,${b64}`;

      const { data: { text } } = await Tesseract.recognize(buffer, "eng", {
        logger: (m) => console.log("Odometer OCR:", m),
        tessedit_char_whitelist: "0123456789",
        psm: Tesseract.PSM.SINGLE_LINE,
      });

      console.log("Odometer OCR raw:", text);

      const justDigits = text.replace(/\D/g, "");
      const match = justDigits.match(/\d{4,7}/);
      if (match) {
        const reading = match[0];
        setVehicleFormData(prev => ({ 
          ...prev, 
          odometer: reading,
          mileage: reading 
        }));
        Alert.alert("Odometer Detected", reading);
      } else {
        Alert.alert(
          "No Reading Found",
          "Could not detect a valid odometer value. Try clearer image."
        );
      }
    } catch (err) {
      console.error("Error in extractOdometer:", err);
      Alert.alert("Error", "Could not read odometer");
    } finally {
      setVehicleFormLoading(false);
    }
  };

  const validateVehicleForm = () => {
    const newErrors = {};
    
    // Only validate VIN (optional but if provided, must be valid)
    if (vehicleFormData.vin && vehicleFormData.vin.trim()) {
      const vinValidation = validateVIN(vehicleFormData.vin);
      if (!vinValidation.isValid) {
        newErrors.vin = vinValidation.message;
      }
    }
    
    // No validation needed for other fields since they're reference only
    // and not saved to the database
    
    setVehicleFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddVehicle = async () => {
    if (!validateVehicleForm()) {
      return;
    }
    
    try {
      setVehicleFormSaving(true);
      
      // Get user_id from AsyncStorage
      const storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) {
        Alert.alert("Error", "User not found. Please sign in first.");
        return;
      }

      // Get company_id from companyData
      if (!companyData || !companyData.id) {
        Alert.alert("Error", "Company information not found. Please complete company setup first.");
        return;
      }

      // Insert vehicle with both company_id and user_id references
      const vehiclePayload = {
        company_id: companyData.id,
        user_id: storedUserId,
        vin: vehicleFormData.vin || null,
        color: vehicleFormData.color || null,
        mileage: vehicleFormData.mileage ? Number(vehicleFormData.mileage) : null,
        odometer: vehicleFormData.odometer ? Number(vehicleFormData.odometer) : null,
        asset_name: vehicleFormData.asset_name || null,
        image_url: null, // You can add image upload functionality later
      };
      
      const { error: vehErr } = await supabase.from("vehicles").insert(vehiclePayload);
      if (vehErr) throw vehErr;

      // Refresh vehicles data
      await fetchUserData();
      
      // Close modal and show success
      closeAddVehicleModal();
      Alert.alert("Success", "Vehicle added successfully!");
      
    } catch (e) {
      console.error("Error adding vehicle:", e);
      Alert.alert("Error", e.message || "Failed to add vehicle. Please try again.");
    } finally {
      setVehicleFormSaving(false);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!validateVehicleForm()) {
      return;
    }
    
    try {
      setVehicleFormSaving(true);
      
      if (!editingVehicle || !editingVehicle.id) {
        Alert.alert("Error", "Vehicle not found for editing.");
        return;
      }

      // Update vehicle with new data
      const vehiclePayload = {
        vin: vehicleFormData.vin || null,
        color: vehicleFormData.color || null,
        mileage: vehicleFormData.mileage ? Number(vehicleFormData.mileage) : null,
        odometer: vehicleFormData.odometer ? Number(vehicleFormData.odometer) : null,
        asset_name: vehicleFormData.asset_name || null,
        image_url: editingVehicle.image_url, // Keep existing image_url
      };
      
      const { error: vehErr } = await supabase
        .from("vehicles")
        .upsert({
          id: editingVehicle.id,
          ...vehiclePayload
        });
      
      if (vehErr) throw vehErr;

      // Refresh vehicles data
      await fetchUserData();
      
      // Close modal and show success
      closeEditVehicleModal();
      Alert.alert("Success", "Vehicle updated successfully!");
      
    } catch (e) {
      console.error("Error updating vehicle:", e);
      Alert.alert("Error", e.message || "Failed to update vehicle. Please try again.");
    } finally {
      setVehicleFormSaving(false);
    }
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
              // Clear all stored authentication data
              await AsyncStorage.removeItem('isOnboardingComplete');
              await AsyncStorage.removeItem('userPhone');
              await AsyncStorage.removeItem('userId');
              
              // Navigate to SignIn screen
              navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
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
    return <FleetLoadingAnimation text="Warming up your fleet..." />;
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
        <Button 
          title="Logout" 
          onPress={handleLogout}
          variant="red"
          style={{minWidth:130}}
        />
      </View>

      {/* Company Information Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}> 
          <Text style={styles.cardTitle}>Company Information</Text>
          {companyData && (
            <Button 
              title="Edit" 
              onPress={openEditCompanyModal}
              variant="white"
              style={{ minWidth: 120 }}
            />
          )}
        </View>
        {companyData ? (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.label}>Company Name</Text>
              </View>
              <Text style={styles.value}>{companyData.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.label}>Phone</Text>
              </View>
              <Text style={styles.value}>{companyData.phone || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
             
                <Text style={styles.label}>Country</Text>
              </View>
              <Text style={styles.value}>{companyData.country || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
             
                <Text style={styles.label}>State</Text>
              </View>
              <Text style={styles.value}>{companyData.state || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
               
                <Text style={styles.label}>Created</Text>
              </View>
              <Text style={styles.value}>{formatDate(companyData.created_at)}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
          
            <Text style={styles.noDataText}>No company data available</Text>
          </View>
        )}
      </View>

      {/* Vehicles Information */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Assets ({vehiclesData.length})</Text>
          <Button 
            title="+ Add Assets to Fleet" 
            onPress={openAddVehicleModal}
            variant="green"
            style={{ minWidth: 130 }}
          />
        </View>
        {vehiclesData.length > 0 ? (
          <View style={styles.vehiclesContainer}>
            {vehiclesData.map((vehicle, index) => (
              <View key={vehicle.id || index} style={styles.vehicleCard}>
                <View style={styles.vehicleHeader}>
                  <View style={styles.vehicleTitleContainer}>
                    <Text style={styles.vehicleTitle}>
                      {vehicle.asset_name || (vehicle.make && vehicle.model ? `${vehicle.make} ${vehicle.model}` : 'Asset')}
                      {vehicle.year && ` (${vehicle.year})`}
                    </Text>
                    <Text style={styles.vehicleVin}>{vehicle.vin || 'No VIN'}</Text>
                  </View>
                  <Button 
                    title="Edit" 
                    onPress={() => openEditVehicleModal(vehicle)}
                    variant="white"
                    style={{ minWidth: 130 }}
                  />
 <Button
      title={isDeleting ? "Deleting..." : "Delete"}
      onPress={() => deleteVehicle(vehicle.id)}
      disabled={isDeleting}
      variant='red'
    />

                </View>
                <View style={styles.vehicleDetails}>
                  {vehicle.asset_name && (
                    <View style={styles.vehicleDetailRow}>
                      <Text style={styles.vehicleDetailLabel}>Asset Name:</Text>
                      <Text style={styles.vehicleDetailValue}>{vehicle.asset_name}</Text>
                    </View>
                  )}
                  {vehicle.vin && (
                    <View style={styles.vehicleDetailRow}>
                      <Text style={styles.vehicleDetailLabel}>VIN:</Text>
                      <Text style={styles.vehicleDetailValue}>{vehicle.vin}</Text>
                    </View>
                  )}
                  {vehicle.make && (
                    <View style={styles.vehicleDetailRow}>
                      <Text style={styles.vehicleDetailLabel}>Make:</Text>
                      <Text style={styles.vehicleDetailValue}>{vehicle.make}</Text>
                    </View>
                  )}
                  {vehicle.model && (
                    <View style={styles.vehicleDetailRow}>
                      <Text style={styles.vehicleDetailLabel}>Model:</Text>
                      <Text style={styles.vehicleDetailValue}>{vehicle.model}</Text>
                    </View>
                  )}
                  {vehicle.year && (
                    <View style={styles.vehicleDetailRow}>
                      <Text style={styles.vehicleDetailLabel}>Year:</Text>
                      <Text style={styles.vehicleDetailValue}>{vehicle.year}</Text>
                    </View>
                  )}
                  {vehicle.color && (
                    <View style={styles.vehicleDetailRow}>
                      <Text style={styles.vehicleDetailLabel}>Color:</Text>
                      <Text style={styles.vehicleDetailValue}>{vehicle.color}</Text>
                    </View>
                  )}
                  {vehicle.mileage && (
                    <View style={styles.vehicleDetailRow}>
                      <Text style={styles.vehicleDetailLabel}>Mileage:</Text>
                      <Text style={styles.vehicleDetailValue}>{vehicle.mileage}</Text>
                    </View>
                  )}
                  {vehicle.odometer && (
                    <View style={styles.vehicleDetailRow}>
                      <Text style={styles.vehicleDetailLabel}>Odometer:</Text>
                      <Text style={styles.vehicleDetailValue}>{vehicle.odometer}</Text>
                    </View>
                  )}
                  <View style={styles.vehicleDetailRow}>
                    <Text style={styles.vehicleDetailLabel}>Added:</Text>
                    <Text style={styles.vehicleDetailValue}>{formatDate(vehicle.created_at)}</Text>
                  </View>
                </View>
                {vehicle.image_url && (
                  <Image source={{ uri: vehicle.image_url }} style={styles.vehicleImage} />
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No vehicles added yet</Text>
            <Button 
              title="+ Add Your First Vehicle" 
              onPress={openAddVehicleModal}
              variant="green"
              style={{ marginTop: 15 }}
            />
          </View>
        )}
      </View>

      {/* User Status Card */}
      <View style={[styles.card, { marginBottom: 100 }]}>
        <View style={styles.cardHeader}>
      
          <Text style={styles.cardTitle}>Account Status</Text>
        </View>
        {userData ? (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
               
                <Text style={styles.label}>Phone Verified</Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: userData.verified ? '#00E676' : '#FF6B35' }
                ]}>
                  <Text style={styles.statusText}>
                    {userData.verified ? '✓ Verified' : ' Pending'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>

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
                
                <Text style={styles.label}>Account Created</Text>
              </View>
              <Text style={styles.value}>{formatDate(userData.created_at)}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>

            <Text style={styles.noDataText}>No user data available</Text>
          </View>
        )}
      </View>

      {/* Add Vehicle Modal */}
      <Modal
        visible={addVehicleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeAddVehicleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Assets</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeAddVehicleModal}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                      {/* VIN Images Section */}
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>VIN Images</Text>
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={() => pickImages(setVinImages, "vin")}
                >
                  <Text style={styles.addImageText}>+ Add VIN Images</Text>
                </TouchableOpacity>
                {vinImages.length > 0 && (
                  <View style={styles.imageGrid}>
                    {vinImages.map((imageUri, index) => (
                      <View key={index} style={styles.imageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.thumbnail} />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeImage(imageUri, setVinImages)}
                        >
                          <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Odometer Images Section */}
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>Odometer Images</Text>
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={() => pickImages(setMeterImages, "meter")}
                >
                  <Text style={styles.addImageText}>+ Add Odometer Images</Text>
                </TouchableOpacity>
                {meterImages.length > 0 && (
                  <View style={styles.imageGrid}>
                    {meterImages.map((imageUri, index) => (
                      <View key={index} style={styles.imageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.thumbnail} />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeImage(imageUri, setMeterImages)}
                        >
                          <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {vehicleFormLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#00E676" size="small" />
                  <Text style={styles.loadingText}>Processing image...</Text>
                </View>
              )}
                <Text style={styles.inputLabel}>Asset Name*</Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.asset_name}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, asset_name: text }))}
                  placeholder="Enter asset name"
                  placeholderTextColor="#666"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>VIN</Text>
                <TextInput
                  style={[styles.modalInput, vehicleFormErrors.vin && styles.inputError]}
                  value={vehicleFormData.vin}
                  onChangeText={(text) => {
                    setVehicleFormData(prev => ({ ...prev, vin: text }));
                    if (vehicleFormErrors.vin) {
                      setVehicleFormErrors(prev => ({ ...prev, vin: null }));
                    }
                  }}
                  placeholder="Enter VIN number"
                  placeholderTextColor="#666"
                />
                {vehicleFormErrors.vin && <Text style={styles.errorText}>{vehicleFormErrors.vin}</Text>}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Color </Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.color}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, color: text }))}
                  placeholder="Enter asset color"
                  placeholderTextColor="#666"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Make </Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.make}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, make: text }))}
                  placeholder="Enter asset make"
                  placeholderTextColor="#666"
                />
                <Text style={styles.helpText}>For reference only - not saved to database</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Model </Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.model}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, model: text }))}
                  placeholder="Enter asset model"
                  placeholderTextColor="#666"
                />
                <Text style={styles.helpText}>For reference only - not saved to database</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Year* </Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.year}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, year: text }))}
                  placeholder="Enter asset year"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                <Text style={styles.helpText}>For reference only - not saved to database</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mileage </Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.mileage}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, mileage: text }))}
                  placeholder="Enter current mileage"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Make </Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.make}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, make: text }))}
                  placeholder="Enter asset make"
                  placeholderTextColor="#666"
                />
                <Text style={styles.helpText}>For reference only - not saved to database</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Model </Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.model}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, model: text }))}
                  placeholder="Enter asset model"
                  placeholderTextColor="#666"
                />
                <Text style={styles.helpText}>For reference only - not saved to database</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Year* </Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.year}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, year: text }))}
                  placeholder="Enter asset year"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                <Text style={styles.helpText}>For reference only - not saved to database</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Odometer* </Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.odometer}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, odometer: text }))}
                  placeholder="Enter odometer reading"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>

        
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button 
                title="Cancel" 
                onPress={closeAddVehicleModal}
                variant="white"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button 
                title={vehicleFormSaving ? "Adding..." : "Add Asset"} 
                onPress={handleAddVehicle}
                variant="green"
                disabled={vehicleFormSaving}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        visible={editVehicleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEditVehicleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Vehicle</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeEditVehicleModal}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Asset Name*</Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.asset_name}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, asset_name: text }))}
                  placeholder="Enter asset name"
                  placeholderTextColor="#666"
                />
              </View>
              
              <View style={styles.inputContainer}>
                             {/* VIN Images Section */}
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>VIN Images (Optional)</Text>
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={() => pickImages(setVinImages, "vin")}
                >
                  <Text style={styles.addImageText}>+ Add VIN Images</Text>
                </TouchableOpacity>
                {vinImages.length > 0 && (
                  <View style={styles.imageGrid}>
                    {vinImages.map((imageUri, index) => (
                      <View key={index} style={styles.imageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.thumbnail} />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeImage(imageUri, setVinImages)}
                        >
                          <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Odometer Images Section */}
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>Odometer Images (Optional)</Text>
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={() => pickImages(setMeterImages, "meter")}
                >
                  <Text style={styles.addImageText}>+ Add Odometer Images</Text>
                </TouchableOpacity>
                {meterImages.length > 0 && (
                  <View style={styles.imageGrid}>
                    {meterImages.map((imageUri, index) => (
                      <View key={index} style={styles.imageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.thumbnail} />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeImage(imageUri, setMeterImages)}
                        >
                          <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {vehicleFormLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#00E676" size="small" />
                  <Text style={styles.loadingText}>Processing image...</Text>
                </View>
              )}
                <Text style={styles.inputLabel}>VIN (Optional)</Text>
                <TextInput
                  style={[styles.modalInput, vehicleFormErrors.vin && styles.inputError]}
                  value={vehicleFormData.vin}
                  onChangeText={(text) => {
                    setVehicleFormData(prev => ({ ...prev, vin: text }));
                    if (vehicleFormErrors.vin) {
                      setVehicleFormErrors(prev => ({ ...prev, vin: null }));
                    }
                  }}
                  placeholder="Enter VIN number"
                  placeholderTextColor="#666"
                />
                {vehicleFormErrors.vin && <Text style={styles.errorText}>{vehicleFormErrors.vin}</Text>}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Color (Optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.color}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, color: text }))}
                  placeholder="Enter asset color"
                  placeholderTextColor="#666"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Make (Reference Only)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.make}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, make: text }))}
                  placeholder="Enter asset make"
                  placeholderTextColor="#666"
                />
                <Text style={styles.helpText}>For reference only - not saved to database</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Model (Reference Only)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.model}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, model: text }))}
                  placeholder="Enter asset model"
                  placeholderTextColor="#666"
                />
                <Text style={styles.helpText}>For reference only - not saved to database</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Year (Reference Only)*</Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.year}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, year: text }))}
                  placeholder="Enter asset year"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                <Text style={styles.helpText}>For reference only - not saved to database</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mileage (Optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.mileage}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, mileage: text }))}
                  placeholder="Enter current mileage"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Make (Reference Only)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.make}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, make: text }))}
                  placeholder="Enter asset make"
                  placeholderTextColor="#666"
                />
                <Text style={styles.helpText}>For reference only - not saved to database</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Model (Reference Only)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.model}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, model: text }))}
                  placeholder="Enter asset model"
                  placeholderTextColor="#666"
                />
                <Text style={styles.helpText}>For reference only - not saved to database</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Year (Reference Only)*</Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.year}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, year: text }))}
                  placeholder="Enter asset year"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                <Text style={styles.helpText}>For reference only - not saved to database</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Odometer (Optional)*</Text>
                <TextInput
                  style={styles.modalInput}
                  value={vehicleFormData.odometer}
                  onChangeText={(text) => setVehicleFormData(prev => ({ ...prev, odometer: text }))}
                  placeholder="Enter odometer reading"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>

 
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button 
                title="Cancel" 
                onPress={closeEditVehicleModal}
                variant="white"
                style={{ flex: 1, marginRight: 8,minWidth:10 }}
              />
              <Button 
                title={vehicleFormSaving ? "Updating..." : "Update asset"} 
                onPress={handleUpdateVehicle}
                variant="green"
                disabled={vehicleFormSaving}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Company Modal */}
      <Modal
        visible={editCompanyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEditCompanyModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Company Information</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeEditCompanyModal}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Company Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editCompanyFormData.name}
                  onChangeText={(text) => setEditCompanyFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter company name"
                  placeholderTextColor="#666"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Country</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editCompanyFormData.country}
                  onChangeText={(text) => setEditCompanyFormData(prev => ({ ...prev, country: text }))}
                  placeholder="Enter country"
                  placeholderTextColor="#666"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editCompanyFormData.state}
                  onChangeText={(text) => setEditCompanyFormData(prev => ({ ...prev, state: text }))}
                  placeholder="Enter state"
                  placeholderTextColor="#666"
                />
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <Button 
                title="Cancel" 
                onPress={closeEditCompanyModal}
                variant="white"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button 
                title={editCompanyLoading ? "Saving..." : "Save Changes"} 
                onPress={handleEditCompanySave}
                variant="green"
                disabled={editCompanyLoading}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* SweetBox Alert for Delete Success */}
      <SweetBox
        visible={showDeleteAlert}
        type="success"
        title="Success!"
        message="Vehicle deleted successfully"
        onConfirm={() => setShowDeleteAlert(false)}
        onClose={() => setShowDeleteAlert(false)}
      />
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
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 15,
    // marginBottom:100,
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
  vehiclesContainer: {
    gap: 12,
  },
  vehicleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleTitleContainer: {
    flex: 1,
  },
  vehicleTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  vehicleVin: {
    color: '#b0b0b0',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  vehicleDetails: {
    gap: 8,
  },
  vehicleDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleDetailLabel: {
    color: '#b0b0b0',
    fontSize: 14,
    fontWeight: '500',
  },
  vehicleDetailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  inputContainer: {
    marginBottom: 20,
    marginTop: 5,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  helpText: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  imageSection: {
    marginVertical: 20,
    marginHorizontal: 5,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addImageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  addImageText: {
    color: '#fff',
    fontSize: 14,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default DashboardScreen;
