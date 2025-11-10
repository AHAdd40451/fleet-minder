import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';

const Splash = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check if user is already logged in and onboarding is complete
      const userId = await AsyncStorage.getItem('userId');
      const isOnboardingComplete = await AsyncStorage.getItem('isOnboardingComplete');
      
      if (userId && isOnboardingComplete === 'true') {
        // User is logged in and onboarding is complete - go to Dashboard
        navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      } else if (userId && isOnboardingComplete === 'false') {
        // User is logged in but onboarding is not complete - go to Onboarding
        navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
      } else {
        // User is not logged in - show splash screen
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setLoading(false);
    }
  };

  const handleJoin = () => {
    navigation.navigate('SignIn');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../../attached_assets/generated_images/Group 1437253997.png')}  
        style={styles.image}
      />

      <Text style={styles.title}>Smart assets maintenance reminders. Never miss a service date again</Text>

      <Text style={styles.paragraph}>
      Smart reminders. Better maintenance. Hassle-free fleet management.
      </Text>

     
      <Button
        title="Let's Go!"
        onPress={handleJoin}
        variant="black"
        style={{ marginTop: 20, width: '100%'}} 
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: '100%',
    height: '55%', 
    resizeMode: 'contain',
    marginBottom: 50,  
  },
  title: {
    color: 'black',
    fontSize: 26,
    fontWeight: '500',
    lineHeight: 36,
    fontFamily: 'Poppins-Medium',
    marginBottom: 15,  
  },
  paragraph: {
    color: 'black',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    lineHeight: 22,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#2e2e2e',
    backgroundColor:"white",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    color: 'black',
    fontSize: 14,
  },
});