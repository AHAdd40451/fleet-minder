import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import OnboardingForm from '../screens/OnBoardingForm';
import Splash from '../screens/Splash';  
import SignIn from '../screens/SignIn';
import VerifyOtp from '../screens/VerifyOtp';

const Stack = createStackNavigator();

export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"  //onboarding 
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={Splash} /> 
        <Stack.Screen name="Onboarding" component={OnboardingForm} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="VerifyOtp" component={VerifyOtp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
