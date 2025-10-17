import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { verifyOtp, checkUserExists } from "../services/otp";
import AsyncStorage from "@react-native-async-storage/async-storage"; 

const { width } = Dimensions.get("window");

const VerifyOtp = ({ navigation, route }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const phone = route?.params?.phone;

  const handlePress = (num) => {
    if (otp.length < 4) {
      setOtp(otp + num);
    }
  };

  const handleDelete = () => {
    setOtp(otp.slice(0, -1));
  };

  const handleContinue = async () => {
    if (otp.length !== 4) {
      Alert.alert('Error', 'Please enter a 4-digit OTP');
      return;
    }

    if (!phone) {
      Alert.alert('Error', 'Phone number not found. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // Verify OTP and handle user creation/routing in one call
      const verifyResult = await verifyOtp(phone, otp);
      if (!verifyResult.ok) {
        Alert.alert('Error', verifyResult.error || 'Invalid OTP');
        return;
      }

      // Store phone number for future use
      await AsyncStorage.setItem('userPhone', phone);

      // Route based on verification result
      if (verifyResult.redirectTo === 'dashboard') {
        // Existing user - go to Dashboard
        await AsyncStorage.setItem('isOnboardingComplete', 'true');
        navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      } else if (verifyResult.redirectTo === 'onboarding') {
        // New user - go to Onboarding
        await AsyncStorage.setItem('isOnboardingComplete', 'false');
        navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.heading}>Enter your OTP</Text>
      <Text style={styles.subText}>
        Create a 4-digit PIN code that will be used every time you login
      </Text>

      <View style={styles.otpContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.otpBox}>
            <Text style={styles.otpText}>{otp[i] || ""}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.warning}>Never share your OTP with anyone</Text>


      <View style={styles.keypad}>
        {["1","2","3","4","5","6","7","8","9","0"].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.key}
            onPress={() => handlePress(num)}
          >
            <Text style={styles.keyText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.key} onPress={handleDelete}>
          <Text style={styles.keyText}>⌫</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.continueButton, loading && styles.buttonDisabled]} 
        onPress={handleContinue}
        disabled={loading}
      >
        <Text style={styles.continueText}>
          {loading ? 'Verifying...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyOtp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 80,
    marginBottom: 10,
    color:"#FFFFFF",
  },
  subText: {
    textAlign: "center",
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginBottom: 15,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  otpText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF", 
  },
  warning: {
    textAlign: "center",
    color: "red",
    marginBottom: 20,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: width * 0.8, 
    alignSelf: "center",
  },
  key: {
    width: width * 0.8 / 3, 
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    fontSize: 22,
    fontWeight: "600",
    color:"#FFFFFF",
  },
  continueButton: {
    backgroundColor: "white",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 30,
    marginHorizontal: 40,
  },
  continueText: {
    color: "black",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
