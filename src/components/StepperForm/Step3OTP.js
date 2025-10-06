import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { verifyOtp } from "../../services/otp";
import { validateOTP } from "../../utils/validation";

const Step3OTP = ({ companyData, vehicleData, userData, setUserData, prevStep, navigation }) => {
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Validate OTP
    const otpValidation = validateOTP(otp);
    if (!otpValidation.isValid) {
      newErrors.otp = otpValidation.message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSending(true);
      // Try OTP verification but do not block saving on failure
      let isVerified = false;
      try {
        const result = await verifyOtp(companyData.phone, otp);
        isVerified = !!result.ok;
      } catch (_) {
        isVerified = false;
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
      const vehiclePayload = {
        company_id: comp.id,
        // Align with existing schema columns
        color: vehicleData.color || null,
        mileage: vehicleData.mileage || null,
        odometer: vehicleData.odometer ? Number(vehicleData.odometer) : null,
        vin: vehicleData.vin || null,
        image_url: vehicleData.carImage || null,
      };
      const { error: vehErr } = await supabase.from("vehicles").insert(vehiclePayload);
      if (vehErr) throw vehErr;

      // 3️⃣ Create user
      const { error: userErr } = await supabase.from("users").insert({
        company_id: comp.id,
        phone: companyData.phone,
        verified: isVerified,
      });
      if (userErr) throw userErr;

      // Direct navigation after successful creation
      console.log('User creation successful, navigating to Home...');
      setTimeout(() => {
        navigation.navigate('Home');
      }, 1000);
      
      Alert.alert(
        "Success",
        isVerified
          ? "Setup completed and phone verified!"
          : "Setup completed. OTP verification failed or was skipped; you may verify later.",
        [
          {
            text: "Continue",
            onPress: () => {
              console.log('Navigating to Home screen...');
              navigation.navigate('Home');
            }
          }
        ]
      );
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phone Verification</Text>
      <View>
        <TextInput
          style={[styles.input, errors.otp && styles.inputError]}
          placeholder="Enter OTP"
          keyboardType="numeric"
          value={otp}
          onChangeText={(text) => {
            setOtp(text);
            if (errors.otp) {
              setErrors(prev => ({ ...prev, otp: null }));
            }
          }}
        />
        {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
      </View>
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
  input: { 
    backgroundColor: "#111", 
    color: "#fff", 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#333"
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
  btn: { backgroundColor: "#fff", padding: 15, borderRadius: 8, width: "48%" },
  btnText: { textAlign: "center", color: "#000", fontWeight: "bold" },
});

export default Step3OTP;
