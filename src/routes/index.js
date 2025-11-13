import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import OnboardingForm from '../screens/OnBoardingForm';
import Splash from '../screens/Splash';  
import SignIn from '../screens/SignIn';
import VerifyOtp from '../screens/VerifyOtp';
import SettingsScreen from '../screens/SettingsScreen';
import BottomNavWrapper from '../Navigation/BottomNavWrapper';
import { supabase } from '../lib/supabase';
import { canAccessSettings } from '../utils/rbac';

const Stack = createStackNavigator();

// Navigation guard for Settings - prevents unauthorized navigation
const SettingsScreenWithGuard = ({ navigation, route }) => {
  const [canAccess, setCanAccess] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) {
        setCanAccess(false);
        setChecking(false);
        navigation.goBack();
        return;
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', storedUserId)
        .single();

      if (error || !user) {
        setCanAccess(false);
        setChecking(false);
        navigation.goBack();
        return;
      }

      const hasAccess = canAccessSettings(user.role);
      setCanAccess(hasAccess);
      setChecking(false);

      if (!hasAccess) {
        // Immediately go back if no access
        setTimeout(() => {
          const parent = navigation.getParent();
          if (parent) {
            parent.goBack();
          } else {
            navigation.goBack();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Access check error:', error);
      setCanAccess(false);
      setChecking(false);
      navigation.goBack();
    }
  };

  if (checking) {
    return null; // Don't render anything while checking
  }

  if (!canAccess) {
    return null; // Don't render if no access
  }

  return <SettingsScreen navigation={navigation} />;
};

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
        {/* Render tabs only on Dashboard by using BottomNavWrapper here */}
        <Stack.Screen name="Dashboard" component={BottomNavWrapper} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="VerifyOtp" component={VerifyOtp} />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreenWithGuard}
          options={{
            // Prevent navigation if user doesn't have access
            gestureEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
