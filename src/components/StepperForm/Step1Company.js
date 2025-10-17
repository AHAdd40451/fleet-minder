import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { requestOtp } from "../../services/otp";
import { validatePhone, validateRequired } from "../../utils/validation";

const Step1Company = ({ data, setData, nextStep }) => {
  const [companyName, setCompanyName] = useState(data.name || "");
  const [phone, setPhone] = useState(data.phone || "");
  const [country, setCountry] = useState(data.country || "");
  const [state, setState] = useState(data.state || "");

  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Validate company name
    const nameValidation = validateRequired(companyName, "Company name");
    if (!nameValidation.isValid) {
      newErrors.companyName = nameValidation.message;
    }
    
    // Validate phone
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.message;
    }
    
    // Validate country
    const countryValidation = validateRequired(country, "Country");
    if (!countryValidation.isValid) {
      newErrors.country = countryValidation.message;
    }
    
    // Validate state
    const stateValidation = validateRequired(state, "State");
    if (!stateValidation.isValid) {
      newErrors.state = stateValidation.message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }
    
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

      <View>
        <TextInput
          style={[styles.input, errors.companyName && styles.inputError]}
          placeholder="Company Name"
          value={companyName}
          onChangeText={(text) => {
            setCompanyName(text);
            if (errors.companyName) {
              setErrors(prev => ({ ...prev, companyName: null }));
            }
          }}
        />
        {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
      </View>

      <View>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          placeholder="Phone"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (errors.phone) {
              setErrors(prev => ({ ...prev, phone: null }));
            }
          }}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>

      <View>
        <TextInput
          style={[styles.input, errors.country && styles.inputError]}
          placeholder="Country"
          value={country}
          onChangeText={(text) => {
            setCountry(text);
            if (errors.country) {
              setErrors(prev => ({ ...prev, country: null }));
            }
          }}
        />
        {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
      </View>

      <View>
        <TextInput
          style={[styles.input, errors.state && styles.inputError]}
          placeholder="State"
          value={state}
          onChangeText={(text) => {
            setState(text);
            if (errors.state) {
              setErrors(prev => ({ ...prev, state: null }));
            }
          }}
        />
        {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleNext} disabled={sending}>
        <Text style={styles.btnText}>{sending ? "Sending..." : "Next"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { color: "#fff", fontSize: 22, marginBottom: 20 },
  input: {
    color: 'white',
    borderWidth: 1,
    borderColor: '#EAE7EC',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 15,
    fontFamily: 'Poppins-Regular',

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
  btn: { backgroundColor: "#fff", padding: 15, borderRadius: 8 },
  btnText: { textAlign: "center", color: "#000", fontWeight: "bold" },
});

export default Step1Company;
