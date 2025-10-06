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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as mime from "react-native-mime-types";
import { supabase } from "../../lib/supabase";

const Step2Vehicle = ({ companyData, data, setData, nextStep, prevStep }) => {
  const [vehicle, setVehicle] = useState(data.vehicle || "");
  const [vin, setVin] = useState(data.vin || "");
  const [odometer, setOdometer] = useState(data.odometer || "");
  const [image, setImage] = useState(data.image || null);
  const [loading, setLoading] = useState(false);

  // Open camera and capture image
  const handlePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // Test Supabase connection
  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.storage.from("vehicle-images").list();
      console.log("Storage bucket test:", { data, error });
      return !error;
    } catch (e) {
      console.error("Storage connection test failed:", e);
      return false;
    }
  };

  // Upload logic
  const handleNext = async () => {
    if (!vehicle) return Alert.alert("Please enter vehicle name");
    setLoading(true);

    let imageUrl = null;

    try {
      // Test storage connection first
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        throw new Error("Cannot connect to storage bucket");
      }

      if (image) {
        const imageName = `vehicle-${Date.now()}.jpg`;

        // Convert local file URI to Blob
        const response = await fetch(image);
        const blob = await response.blob();
        
        console.log("Blob size:", blob.size);
        console.log("Blob type:", blob.type);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("vehicle-images")
          .upload(imageName, blob, {
            contentType: "image/jpeg",
            upsert: true,
          });
          
        console.log("Upload data:", uploadData);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: urlData, error: urlError } = supabase.storage
          .from("vehicle-images")
          .getPublicUrl(imageName);

        if (urlError) {
          console.error("URL error:", urlError);
          throw urlError;
        }

        imageUrl = urlData.publicUrl;
        console.log("Image uploaded successfully:", imageUrl);
      }

      setData({ vehicle, vin, odometer, image: imageUrl });
      nextStep();
    } catch (e) {
      console.error("Upload failed:", e);
      Alert.alert("Upload Failed", e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vehicle Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Vehicle Model"
        placeholderTextColor="#777"
        value={vehicle}
        onChangeText={setVehicle}
      />

      <TextInput
        style={styles.input}
        placeholder="VIN"
        placeholderTextColor="#777"
        value={vin}
        onChangeText={setVin}
      />

      <TextInput
        style={styles.input}
        placeholder="Odometer"
        placeholderTextColor="#777"
        value={odometer}
        onChangeText={setOdometer}
      />

      <TouchableOpacity style={styles.imageBox} onPress={handlePhoto}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={{ color: "#888" }}>Tap to take photo</Text>
        )}
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btn} onPress={prevStep}>
            <Text style={styles.btnText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={handleNext}>
            <Text style={styles.btnText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 15,
  },
  imageBox: {
    height: 150,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center", 
    borderRadius: 8,
    marginBottom: 15,
  },
  image: { width: "100%", height: "100%", borderRadius: 8 },
  btnRow: { flexDirection: "row", justifyContent: "space-between" },
  btn: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    width: "48%",
  },
  btnText: { textAlign: "center", color: "#000", fontWeight: "bold" },
});

export default Step2Vehicle;
