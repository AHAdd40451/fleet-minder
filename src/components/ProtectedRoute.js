import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { canAccessSettings } from '../utils/rbac';

/**
 * Protected Route Component - Prevents unauthorized access to Settings
 * This component checks user role before allowing navigation
 */
export const useSettingsGuard = (navigation) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', storedUserId)
        .single();

      if (error) {
        console.error('Error checking authorization:', error);
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      const hasAccess = canAccessSettings(user?.role);
      setIsAuthorized(hasAccess);

      if (!hasAccess) {
        // Prevent navigation and redirect
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
      console.error('Authorization check error:', error);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAuthorized, loading };
};

