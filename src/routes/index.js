import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import OnboardingForm from '../screens/OnBoardingForm';
import DashboardScreen from '../screens/DashboardScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

export default function Routes() {
  const [initialRoute, setInitialRoute] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const localFlag = await AsyncStorage.getItem('isOnboardingComplete');
        setInitialRoute(localFlag === 'true' ? 'Dashboard' : 'Onboarding');
      } catch (_) {
        setInitialRoute('Onboarding');
      }
    })();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingForm} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}