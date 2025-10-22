import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { requestOtp } from '../services/otp';
import Button from '../components/Button';

const SignIn = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Format phone number to only allow numeric characters
  const formatPhoneNumber = (text) => {
    // Remove all non-numeric characters
    const numericOnly = text.replace(/[^0-9]/g, '');
    return numericOnly;
  };

  // Validate phone number format
  const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber || phoneNumber.length === 0) {
      return 'Phone number is required';
    }
    if (phoneNumber.length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    if (phoneNumber.length > 15) {
      return 'Phone number cannot exceed 15 digits';
    }
    // Check if it contains only numbers
    if (!/^[0-9]+$/.test(phoneNumber)) {
      return 'Phone number can only contain numbers';
    }
    return null;
  };

  const handlePhoneChange = (text) => {
    const formattedPhone = formatPhoneNumber(text);
    setPhone(formattedPhone);
    
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError('');
    }
  };

  const handleSubmit = async () => {
    // Validate phone number
    const validationError = validatePhoneNumber(phone);
    if (validationError) {
      setPhoneError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await requestOtp(phone);
      if (result.ok) {
        navigation.navigate('VerifyOtp', { phone });
      } else {
        Alert.alert('Error', result.error || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
     
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>
        Enter your phone number to Sign in or Create account in Square
      </Text>

      <TextInput
        placeholder="Phone Number"
        placeholderTextColor="#FFFFFF"
        style={[styles.input, phoneError && styles.inputError]}
        keyboardType="phone-pad"
        maxLength={15}
        value={phone}
        onChangeText={handlePhoneChange}
        autoComplete="tel"
        textContentType="telephoneNumber"
      />
      {phoneError ? (
        <Text style={styles.errorText}>{phoneError}</Text>
      ) : null}

      
      <Button
      title={loading ? 'Sending...' : 'Submit'}
      onPress={handleSubmit}
      variant="white"
      disabled={loading}
      style={[loading && styles.buttonDisabled]}
      />

      {/* <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.footerText1}>or</Text>
        <View style={styles.line} />
      </View>

      <Text style={styles.footerText}>
        Sign in as guest
      </Text> */}
    </View>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    color:"#FFFFFF",
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 30,
    fontFamily: 'Poppins-Regular',
    marginTop: 80,
    color:"#FFFFFF",
  },
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
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  line: {
    width: 80,
    height: 1,
    backgroundColor: '#BCBCBC',
  },
  footerText1: {
    marginHorizontal: 10,
    color: '#BCBCBC',
    textAlign: 'center',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    fontFamily: 'Poppins-Regular',
  },
});
