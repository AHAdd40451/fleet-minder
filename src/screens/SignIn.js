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

  // Format phone number to USA format (XXX) XXX-XXXX
  const formatPhoneNumber = (text) => {
    // Remove all non-numeric characters
    const numericOnly = text.replace(/[^0-9]/g, '');
    
    // Limit to 10 digits for USA format
    const limited = numericOnly.slice(0, 10);
    
    // Format as (XXX) XXX-XXXX
    if (limited.length === 0) return '';
    if (limited.length <= 3) return `(${limited}`;
    if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  };

  // Validate USA phone number format
  const validatePhoneNumber = (phoneNumber) => {
    // Remove formatting to get just digits
    const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');
    
    if (!digitsOnly || digitsOnly.length === 0) {
      return 'Phone number is required';
    }
    
    if (digitsOnly.length !== 10) {
      return 'Please enter a valid 10-digit US phone number';
    }
    
    // Check for valid area code (first digit cannot be 0 or 1)
    const areaCode = digitsOnly.slice(0, 3);
    if (areaCode[0] === '0' || areaCode[0] === '1') {
      return 'Invalid area code. Area code cannot start with 0 or 1';
    }
    
    // Check for valid exchange code (fourth digit cannot be 0 or 1)
    const exchangeCode = digitsOnly.slice(3, 6);
    if (exchangeCode[0] === '0' || exchangeCode[0] === '1') {
      return 'Invalid exchange code. Exchange code cannot start with 0 or 1';
    }
    
    // Check for common invalid patterns
    if (areaCode === exchangeCode && areaCode === digitsOnly.slice(6)) {
      return 'Phone number cannot have all identical digits';
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
      // Send only digits to the OTP service
      const digitsOnly = phone.replace(/[^0-9]/g, '');
      const result = await requestOtp(digitsOnly);
      if (result.ok) {
        navigation.navigate('VerifyOtp', { phone: digitsOnly });
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
        placeholder="(555) 123-4567"
        placeholderTextColor="#FFFFFF"
        style={[styles.input, phoneError && styles.inputError]}
        keyboardType="phone-pad"
        maxLength={14}
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
