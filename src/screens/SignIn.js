import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const SignIn = () => {
  const navigation = useNavigation();

  const handleSubmit = () => {
    
    navigation.navigate('VerifyOtp');
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
        placeholderTextColor="#888"
        style={styles.input}
        keyboardType="phone-pad"
        maxLength={11}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.footerText1}>or</Text>
        <View style={styles.line} />
      </View>

      <Text style={styles.footerText}>
        Sign in as guest
      </Text>
    </View>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#EAE7EC',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 15,
    fontFamily: 'Poppins-Regular',
  },
  button: {
    backgroundColor: '#2E2E2E',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
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
    color: '#181818',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
});
