import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

const OnboardingForm = () => {
  const [companyName, setCompanyName] = useState("");
  const [state, setState] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [vin, setVin] = useState("");
  const [odometer, setOdometer] = useState("");

  const handleSubmit = () => {
    console.log({ companyName, state, vehicle, vin, odometer });
  };

  return (
    <LinearGradient colors={["#000", "#111"]} style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Quick Setup</Text>
        <Text style={styles.subHeader}>Fill in your company and first vehicle details</Text>

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

        {/* Vehicle */}
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

        {/* Submit */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
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
  button: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  buttonText: { color: "#000", fontWeight: "600", fontSize: 16 },
});

export default OnboardingForm;
