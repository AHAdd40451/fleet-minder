import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const Splash = () => {
    const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Image
        source={require('../../attached_assets/generated_images/Group 1437253997.png')}  
        style={styles.image}
      />

      <Text style={styles.title}>Smart vehicle maintenance reminders. Never miss a service date again</Text>

      <Text style={styles.paragraph}>
      Smart reminders. Better maintenance. Hassle-free fleet management.
      </Text>

      <TouchableOpacity 
  style={styles.button} 
  onPress={() => navigation.navigate('SignIn')}
>
  <Text style={styles.buttonText}>Join</Text>
</TouchableOpacity>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '500',
    lineHeight: 36,
    fontFamily: 'Poppins-Medium',
    marginBottom: 15,  
  },
  paragraph: {
    color: '#FFFFFF',
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