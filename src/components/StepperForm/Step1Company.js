import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { validateRequired } from "../../utils/validation";

const Step1Company = ({ data, setData, nextStep }) => {
  const [companyName, setCompanyName] = useState(data.name || "");
  const [country, setCountry] = useState(data.country || "");
  const [state, setState] = useState(data.state || "");

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Validate company name
    const nameValidation = validateRequired(companyName, "Company name");
    if (!nameValidation.isValid) {
      newErrors.companyName = nameValidation.message;
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

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }
    
    setData({ name: companyName, country, state });
    nextStep();
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

      <TouchableOpacity style={styles.btn} onPress={handleNext}>
        <Text style={styles.btnText}>Next</Text>
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
