import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const Step1Company = ({ data, setData, nextStep }) => {
  const [companyName, setCompanyName] = useState(data.name || "");
  const [phone, setPhone] = useState(data.phone || "");
  const [country, setCountry] = useState(data.country || "");
  const [state, setState] = useState(data.state || "");

  const handleNext = () => {
    if (!companyName || !phone || !country || !state) return alert("Fill all fields");
    setData({ name: companyName, phone, country, state });
    nextStep();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Company Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Company Name"
        value={companyName}
        onChangeText={setCompanyName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Country"
        value={country}
        onChangeText={setCountry}
      />
      <TextInput
        style={styles.input}
        placeholder="State"
        value={state}
        onChangeText={setState}
      />

      <TouchableOpacity style={styles.btn} onPress={handleNext}>
        <Text style={styles.btnText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { color: "#fff", fontSize: 22, marginBottom: 20 },
  input: { backgroundColor: "#111", color: "#fff", padding: 12, borderRadius: 8, marginBottom: 15 },
  btn: { backgroundColor: "#fff", padding: 15, borderRadius: 8 },
  btnText: { textAlign: "center", color: "#000", fontWeight: "bold" },
});

export default Step1Company;
