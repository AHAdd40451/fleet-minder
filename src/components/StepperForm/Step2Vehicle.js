import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import Tesseract from "tesseract.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../lib/supabase";
import { validateVIN, validateYear, validateNumeric, validateRequired } from "../../utils/validation";

const Step2Vehicle = ({ companyData, data, setData, nextStep, prevStep, navigation }) => {
  const [vin, setVin] = useState(data.vin || "");
  const [make, setMake] = useState(data.make || "");
  const [model, setModel] = useState(data.model || "");
  const [year, setYear] = useState(data.year || "");
  const [mileage, setMileage] = useState(data.mileage || "");
  const [odometer, setOdometer] = useState(data.odometer || "");
  const [vinImages, setVinImages] = useState(data.vinImages || []);
  const [meterImages, setMeterImages] = useState(data.meterImages || []);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

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
      setLoading(true);
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
        setVin(detected);
        Alert.alert("VIN Detected", detected);
      }

      const yearMatch = text.match(/20\d{2}|19\d{2}/);
      if (yearMatch) setYear(yearMatch[0]);

      const makeMatch = text.match(
        /(TOYOTA|HONDA|FORD|CHEVROLET|BMW|NISSAN|TESLA|MERCEDES|HYUNDAI|KIA|VOLKSWAGEN|JEEP|DODGE)/i
      );
      if (makeMatch) setMake(makeMatch[0].toUpperCase());

      const modelMatch = text.match(
        /(CIVIC|COROLLA|CAMRY|F150|MODEL\s?3|ACCORD|ALTIMA|SONATA|TUCSON|GOLF|CHARGER|WRANGLER)/i
      );
      if (modelMatch) setModel(modelMatch[0].toUpperCase());
    } catch (err) {
      console.error("Error in extractVin:", err);
      Alert.alert("Error", "Could not read VIN");
    } finally {
      setLoading(false);
    }
  };

  const extractOdometer = async (imageUri) => {
    try {
      setLoading(true);
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
        setOdometer(reading);
        setMileage(reading);
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
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate VIN (optional but if provided, must be valid)
    if (vin && vin.trim()) {
      const vinValidation = validateVIN(vin);
      if (!vinValidation.isValid) {
        newErrors.vin = vinValidation.message;
      }
    }
    
    // Validate make (required)
    const makeValidation = validateRequired(make, "Make");
    if (!makeValidation.isValid) {
      newErrors.make = makeValidation.message;
    }
    
    // Validate model (required)
    const modelValidation = validateRequired(model, "Model");
    if (!modelValidation.isValid) {
      newErrors.model = modelValidation.message;
    }
    
    // Validate year (required)
    const yearValidation = validateYear(year);
    if (!yearValidation.isValid) {
      newErrors.year = yearValidation.message;
    }
    
    // Validate mileage (optional but if provided, must be numeric)
    if (mileage && mileage.trim()) {
      const mileageValidation = validateNumeric(mileage, "Mileage", 0, 999999);
      if (!mileageValidation.isValid) {
        newErrors.mileage = mileageValidation.message;
      }
    }
    
    // Validate odometer (optional but if provided, must be numeric)
    if (odometer && odometer.trim()) {
      const odometerValidation = validateNumeric(odometer, "Odometer", 0, 999999);
      if (!odometerValidation.isValid) {
        newErrors.odometer = odometerValidation.message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinish = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Get user_id from AsyncStorage (set during sign-in)
      const storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) {
        Alert.alert("Error", "User not found. Please sign in first.");
        return;
      }

      // 1️⃣ Insert company with user_id reference
      const { data: comp, error: compErr } = await supabase.from("companies").insert({
        name: companyData.name,
        country: companyData.country,
        state: companyData.state,
        user_id: storedUserId, // Reference to existing user
      }).select().single();
      if (compErr) throw compErr;

      // 2️⃣ Insert vehicle with both company_id and user_id references
      const vehiclePayload = {
        company_id: comp.id,
        user_id: storedUserId, // Reference to existing user
        vin: vin || null,
        // Add other fields if they exist in your schema
        // make: make || null,
        // model: model || null,
        // year: year ? Number(year) : null,
        // color: null,
        // mileage: mileage ? Number(mileage) : null,
        // odometer: odometer ? Number(odometer) : null,
        // image_url: null,
      };
      const { error: vehErr } = await supabase.from("vehicles").insert(vehiclePayload);
      if (vehErr) throw vehErr;

      // 3️⃣ Update user with company_id and mark onboarding as complete
      // Get user phone from AsyncStorage to include in upsert
      const storedUserPhone = await AsyncStorage.getItem('userPhone');
      
      const { error: updateUserErr } = await supabase
        .from('users')
        
        .upsert({ 
          id: storedUserId,
          phone: storedUserPhone, // Include phone to satisfy NOT NULL constraint
          company_id: comp.id,
          is_onboarding_complete: true 
        });
      
      if (updateUserErr) console.warn('Could not update user:', updateUserErr);

      // Persist local gate so user skips onboarding next app launch
      await AsyncStorage.setItem("isOnboardingComplete", "true");

      // Navigate to Dashboard
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      
      Alert.alert(
        "Success",
        "Setup completed successfully!",
        [{ text: "OK" }]
      );
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to save data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vehicle Information</Text>

      <View>
        <TextInput
          style={[styles.input, errors.vin && styles.inputError]}
          placeholder="VIN (Optional)"
          placeholderTextColor="#777"
          value={vin}
          onChangeText={(text) => {
            setVin(text);
            if (errors.vin) {
              setErrors(prev => ({ ...prev, vin: null }));
            }
          }}
        />
        {errors.vin && <Text style={styles.errorText}>{errors.vin}</Text>}
      </View>

      <View>
        <TextInput
          style={[styles.input, errors.make && styles.inputError]}
          placeholder="Make *"
          placeholderTextColor="#777"
          value={make}
          onChangeText={(text) => {
            setMake(text);
            if (errors.make) {
              setErrors(prev => ({ ...prev, make: null }));
            }
          }}
        />
        {errors.make && <Text style={styles.errorText}>{errors.make}</Text>}
      </View>

      <View>
        <TextInput
          style={[styles.input, errors.model && styles.inputError]}
          placeholder="Model *"
          placeholderTextColor="#777"
          value={model}
          onChangeText={(text) => {
            setModel(text);
            if (errors.model) {
              setErrors(prev => ({ ...prev, model: null }));
            }
          }}
        />
        {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}
      </View>

      <View>
        <TextInput
          style={[styles.input, errors.year && styles.inputError]}
          placeholder="Year *"
          placeholderTextColor="#777"
          value={year}
          onChangeText={(text) => {
            setYear(text);
            if (errors.year) {
              setErrors(prev => ({ ...prev, year: null }));
            }
          }}
          keyboardType="numeric"
        />
        {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
      </View>

      <View>
        <TextInput
          style={[styles.input, errors.mileage && styles.inputError]}
          placeholder="Mileage (Optional)"
          placeholderTextColor="#777"
          value={mileage}
          onChangeText={(text) => {
            setMileage(text);
            if (errors.mileage) {
              setErrors(prev => ({ ...prev, mileage: null }));
            }
          }}
          keyboardType="numeric"
        />
        {errors.mileage && <Text style={styles.errorText}>{errors.mileage}</Text>}
      </View>

      <View>
        <TextInput
          style={[styles.input, errors.odometer && styles.inputError]}
          placeholder="Odometer (Optional)"
          placeholderTextColor="#777"
          value={odometer}
          onChangeText={(text) => {
            setOdometer(text);
            if (errors.odometer) {
              setErrors(prev => ({ ...prev, odometer: null }));
            }
          }}
          keyboardType="numeric"
        />
        {errors.odometer && <Text style={styles.errorText}>{errors.odometer}</Text>}
      </View>

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

      {loading && <ActivityIndicator color="#fff" style={{ marginTop: 10 }} />}

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.btn} onPress={prevStep}>
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.btn, saving && styles.btnDisabled]} 
          onPress={handleFinish}
          disabled={saving}
        >
          <Text style={styles.btnText}>{saving ? "Saving..." : "Finish"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { color: "#fff", fontSize: 22, marginBottom: 20 },
  input: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#333",
  },
  inputError: {
    borderColor: "#ff4444",
    borderWidth: 1,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  imageSection: {
    marginVertical: 15,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  addImageButton: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#555",
    borderStyle: "dashed",
  },
  addImageText: {
    color: "#fff",
    fontSize: 14,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imageContainer: {
    position: "relative",
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  btn: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    width: "48%",
  },
  btnDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  btnText: { textAlign: "center", color: "#000", fontWeight: "bold" },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default Step2Vehicle;
