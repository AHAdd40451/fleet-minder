import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { requestOtp } from "../../services/otp";

const Step1Company = ({ data, setData, nextStep }) => {
  const [companyName, setCompanyName] = useState(data.name || "");
  const [phone, setPhone] = useState(data.phone || "");
  const [country, setCountry] = useState(data.country || "");
  const [state, setState] = useState(data.state || "");

  const [sending, setSending] = useState(false);

  const handleNext = async () => {
    if (!companyName || !phone || !country || !state) return Alert.alert("Missing Info", "Fill all fields");
    try {
      setSending(true);
      const result = await requestOtp(phone);
      if (!result.ok) {
        return Alert.alert("OTP Error", result.error || "Failed to send OTP");
      }
      setData({ name: companyName, phone, country, state });
      nextStep();
    } catch (e) {
      Alert.alert("OTP Error", e?.message || "Failed to send OTP");
    } finally {
      setSending(false);
    }
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

      <TouchableOpacity style={styles.btn} onPress={handleNext} disabled={sending}>
        <Text style={styles.btnText}>{sending ? "Sending..." : "Next"}</Text>
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
