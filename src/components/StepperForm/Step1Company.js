import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { validateRequired } from "../../utils/validation";
import { Picker } from "@react-native-picker/picker";
import axios from 'axios';
import Button from "../../components/Button";

const Step1Company = ({ data, setData, nextStep }) => {
  const [companyName, setCompanyName] = useState(data.name || "");
  const [country, setCountry] = useState(data.country || "United States");
  const [state, setState] = useState(data.state || "");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]); 
  const [errors, setErrors] = useState({});

  const fetchCountries = async () => {
    try {
      const response = await axios.get("https://countriesnow.space/api/v0.1/countries");
      const list = response.data.data.map((item) => item.country).sort();
      setCountries(list);
    } catch (err) {
      console.log("Country API Error:", err);
    }
  };

   // Fetch States based on selected country
   const fetchStates = async (selectedCountry) => {
    try {
      const response = await axios.post("https://countriesnow.space/api/v0.1/countries/states", {
        country: selectedCountry
      });
      const list = response.data.data.states.map((item) => item.name).sort();
      setStates(list);
    } catch (err) {
      console.log("State API Error:", err);
      setStates([]);
    }
  };
 
  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (country) {
      fetchStates(country);
    }
  }, [country]);

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


      {/* <View>
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
      </View> */}
        {/*  Country Dropdown */}
        <View >
        <Picker
          selectedValue={country}
          onValueChange={(itemValue) => {
            setCountry(itemValue);
            setState("");
            if (errors.country) {
              setErrors((prev) => ({ ...prev, country: null }));
            }
          }}
          style={[
            styles.input,
            { color: "#fff", backgroundColor: "#000" },
            errors.country && styles.inputError,
          ]}
          dropdownIconColor="#000" 
           mode="dropdown"
        >
          {countries.length > 0 ? (
            countries.map((c, i) => <Picker.Item key={i} label={c} value={c}  color="#fff" style={{ backgroundColor: '#000' }} />)
          ) : (
            <Picker.Item label="Loading countries..." value=""  color="#fff"
            style={{ backgroundColor: '#000' }} />
          )}
        </Picker>
        {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
      </View>

      {/* <View>
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
      </View> */}
      <View> 
        <Picker
          selectedValue={state}
          onValueChange={(itemValue) => {
            setState(itemValue);
            if (errors.state) {
              setErrors((prev) => ({ ...prev, state: null }));
            }
          }}
          style={[
            styles.input,
            { color: "#fff", backgroundColor: "#000" }, 
            errors.state && styles.inputError,
          ]}
          dropdownIconColor="#fff"
           mode="dropdown"
          enabled={states.length > 0}
          
        >
          <Picker.Item 
            label="Select State" 
            value="" 
            color="#fff" 
            style={{ backgroundColor: '#000' }} 
          />
          {states.length > 0 ? (
            states.map((s, i) => (
              <Picker.Item 
                key={i} 
                label={s} 
                value={s} 
                color="#fff" 
                style={{ backgroundColor: '#000' }} 
              />
            ))
          ) : (
            <Picker.Item 
              label="Select country first..." 
              value="" 
              color="#fff"
              style={{ backgroundColor: '#000' }} 
            />
          )}
        </Picker>
        {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
      </View>

      {/* <TouchableOpacity style={styles.btn} onPress={handleNext}>
        <Text style={styles.btnText}>Next</Text>
      </TouchableOpacity> */}
      <Button
      title='Next'
      onPress={handleNext}
      variant="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { color: "#fff", fontSize: 22, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    color: '#FFFFFF',
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
