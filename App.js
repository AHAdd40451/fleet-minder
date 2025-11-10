import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import Routes from './src/routes';
import { syncQueue } from './src/services/syncService';
import { isOnline } from './src/services/network';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Initialize database and sync on app start if online
    const initializeApp = async () => {
      try {
        // Database is initialized when imported
        // Sync pending items if online
        if (isOnline()) {
          await syncQueue();
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Routes />
    </GestureHandlerRootView>
  );
}