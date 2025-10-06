import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { verifyOtp } from "../../services/otp";

const Step3OTP = ({ companyData, vehicleData, userData, setUserData, prevStep }) => {
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);

  const handleCreate = async () => {
    try {
      setSending(true);
      // Verify OTP first
      const result = await verifyOtp(companyData.phone, otp);
      if (!result.ok) {
        throw new Error(result.error || "Invalid OTP");
      }

      // 1️⃣ Insert company
      const { data: comp, error: compErr } = await supabase.from("companies").insert({
        name: companyData.name,
        phone: companyData.phone,
        country: companyData.country,
        state: companyData.state,
      }).select().single();
      if (compErr) throw compErr;

      // 2️⃣ Insert vehicle
      await supabase.from("vehicles").insert({
        company_id: comp.id,
        color: vehicleData.color || "",
        mileage: vehicleData.mileage || "",
        odometer: vehicleData.odometer,
        vin: vehicleData.vin,
        image_url: vehicleData.image,
      });

      // 3️⃣ Create user
      await supabase.from("users").insert({
        company_id: comp.id,
        phone: companyData.phone,
        verified: true,
      });

      Alert.alert("Success", "Setup completed!");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phone Verification</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity style={styles.btn} onPress={prevStep}>
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={sending}>
          <Text style={styles.btnText}>{sending ? "Creating..." : "Finish"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { color: "#fff", fontSize: 22, marginBottom: 20 },
  input: { backgroundColor: "#111", color: "#fff", padding: 12, borderRadius: 8, marginBottom: 15 },
  btn: { backgroundColor: "#fff", padding: 15, borderRadius: 8, width: "48%" },
  btnText: { textAlign: "center", color: "#000", fontWeight: "bold" },
});

export default Step3OTP;
