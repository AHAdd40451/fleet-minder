import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { verifyOtp, checkUserExists } from "../services/otp";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import Button from "../components/Button";

const { width } = Dimensions.get("window");

const VerifyOtp = ({ navigation, route }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const phone = route?.params?.phone;
  const inputRef = useRef(null);

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
        setLoading(false);
        return;
      }

      // Show verified state with animation
      setVerified(true);
      setLoading(false);
      
      // Animate the verified label
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Store phone number and user_id for future use
      await AsyncStorage.setItem('userPhone', phone);
      if (verifyResult.user && verifyResult.user.id) {
        await AsyncStorage.setItem('userId', verifyResult.user.id);
      }

      // Wait for 0.8 seconds before navigation
      setTimeout(() => {
        // Route based on verification result
        if (verifyResult.redirectTo === 'dashboard') {
          // Existing user with completed onboarding - go to Dashboard
          AsyncStorage.setItem('isOnboardingComplete', 'true').then(() => {
            navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
          });
        } else if (verifyResult.redirectTo === 'onboarding') {
          // New user or existing user without completed onboarding - go to Onboarding
          AsyncStorage.setItem('isOnboardingComplete', 'false').then(() => {
            navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
          });
        }
      }, 800);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
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

      {!verified ? (
        <>
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
        </>
      ) : (
        <Animated.View style={[styles.verifiedContainer, { opacity: fadeAnim }]}>
          <View style={styles.verifiedIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.verifiedText}>Verified!</Text>
          <Text style={styles.verifiedSubText}>Redirecting...</Text>
        </Animated.View>
      )}
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
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  warning: {
    textAlign: "center",
    color: "red",
    marginBottom: 20,
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
  verifiedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  verifiedIcon: {
    marginBottom: 20,
  },
  verifiedText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
  },
  verifiedSubText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
});
