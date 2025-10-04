import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";

const OnboardingForm = () => {
  const [companyName, setCompanyName] = useState("");
  const [state, setState] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [vin, setVin] = useState("");
  const [odometer, setOdometer] = useState("");
  const [image, setImage] = useState(null);

  // 📸 Open camera instead of gallery
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

  const handleSubmit = () => {
    console.log({
      companyName,
      state,
      vehicle,
      vin,
      odometer,
      image,
    });
  };

  return (
    <LinearGradient colors={["#000", "#111"]} style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Quick Setup</Text>
        <Text style={styles.subHeader}>
          Fill in your company and vehicle details
        </Text>

        {/* Company Name */}
        <Text style={styles.label}>Company Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter company name"
          placeholderTextColor="#666"
          value={companyName}
          onChangeText={setCompanyName}
        />

        {/* State */}
        <Text style={styles.label}>State</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter state"
          placeholderTextColor="#666"
          value={state}
          onChangeText={setState}
        />

        {/* Vehicle Name */}
        <Text style={styles.label}>Vehicle Name/Model</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter vehicle name"
          placeholderTextColor="#666"
          value={vehicle}
          onChangeText={setVehicle}
        />

        {/* VIN */}
        <Text style={styles.label}>VIN (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter VIN number"
          placeholderTextColor="#666"
          value={vin}
          onChangeText={setVin}
        />

        {/* Odometer */}
        <Text style={styles.label}>Odometer (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter odometer reading"
          placeholderTextColor="#666"
          value={odometer}
          onChangeText={setOdometer}
          keyboardType="numeric"
        />

        {/* Image Capture Field */}
        <Text style={styles.label}>Vehicle Photo</Text>
        <TouchableOpacity style={styles.imageBox} onPress={handleTakePhoto}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.placeholder}>Tap to open camera</Text>
          )}
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Continue</Text>
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
    resizeMode: "cover",
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
