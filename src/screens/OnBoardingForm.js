import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as mime from "react-native-mime-types";
import { supabase } from "../lib/supabase";

const OnboardingForm = () => {
  const [companyName, setCompanyName] = useState("");
  const [state, setState] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [vin, setVin] = useState("");
  const [odometer, setOdometer] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📸 open camera
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 🧠 Upload file properly (fixed Base64 encoding)
  const uploadImageToSupabase = async (fileUri) => {
    try {
      const imageName = `vehicle-${Date.now()}.jpg`;
      const contentType = mime.lookup(fileUri) || "image/jpeg";

      // ✅ Fixed: use plain "base64" string
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: "base64",
      });

      // Convert Base64 → binary using Uint8Array (React Native compatible)
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { data, error } = await supabase.storage
        .from("vehicle-images")
        .upload(imageName, bytes, { contentType });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from("vehicle-images")
        .getPublicUrl(imageName);

      return publicUrl.publicUrl;
    } catch (err) {
      console.error("Upload failed:", err);
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (!companyName || !state || !vehicle) {
      Alert.alert("Missing Info", "Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      let uploadedUrl = null;

      if (image) {
        uploadedUrl = await uploadImageToSupabase(image);
      }

      const { error } = await supabase.from("onboarding").insert([
        {
          company_name: companyName,
          state,
          vehicle,
          vin,
          odometer,
          image_url: uploadedUrl,
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Details saved successfully!");
      setCompanyName("");
      setState("");
      setVehicle("");
      setVin("");
      setOdometer("");
      setImage(null);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "Failed to save data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#000", "#111"]} style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Quick Setup</Text>
        <Text style={styles.subHeader}>
          Fill in your company and vehicle details
        </Text>

        <Text style={styles.label}>Company Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter company name"
          placeholderTextColor="#666"
          value={companyName}
          onChangeText={setCompanyName}
        />

        <Text style={styles.label}>State</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter state"
          placeholderTextColor="#666"
          value={state}
          onChangeText={setState}
        />

        <Text style={styles.label}>Vehicle Name/Model</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter vehicle name"
          placeholderTextColor="#666"
          value={vehicle}
          onChangeText={setVehicle}
        />

        <Text style={styles.label}>VIN (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter VIN number"
          placeholderTextColor="#666"
          value={vin}
          onChangeText={setVin}
        />

        <Text style={styles.label}>Odometer (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter odometer reading"
          placeholderTextColor="#666"
          value={odometer}
          onChangeText={setOdometer}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Vehicle Photo</Text>
        <TouchableOpacity style={styles.imageBox} onPress={handleTakePhoto}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.placeholder}>Tap to open camera</Text>
          )}
        </TouchableOpacity>

        {loading && (
          <ActivityIndicator
            color="#fff"
            style={{ marginTop: 15, marginBottom: 10 }}
          />
        )}

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : "Continue"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 15,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#fff",
  },
  imageBox: {
    backgroundColor: "#1a1a1a",
    height: 180,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  placeholder: {
    color: "#777",
    fontSize: 14,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default OnboardingForm;
