import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons"; 

const { width } = Dimensions.get("window");

const VerifyOtp = ({ navigation }) => {
  const [otp, setOtp] = useState("");

  const handlePress = (num) => {
    if (otp.length < 4) {
      setOtp(otp + num);
    }
  };

  const handleDelete = () => {
    setOtp(otp.slice(0, -1));
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

      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyOtp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  },
  subText: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
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
  },
  continueButton: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 30,
    marginHorizontal: 40,
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});
