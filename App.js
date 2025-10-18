import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import Routes from './src/routes';
import BottomNavWrapper from './src/navigation/BottomNavWrapper';


const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Routes />
      <BottomNavWrapper/>
    
    </GestureHandlerRootView>
  );
}