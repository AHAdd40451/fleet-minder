import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

const Setting = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        try {
          const userId = await AsyncStorage.getItem("userId");
          
          if (!userId) {
            if (active) {
              Alert.alert("Error", "User not found. Please sign in again.");
              navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });
            }
            return;
          }

          // Fetch user data from Supabase
          const { data: user, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", userId)
            .single();

          if (error) {
            console.error("Error fetching user role:", error);
            if (active) {
              Alert.alert("Error", "Failed to verify user role.");
              navigation.goBack();
            }
            return;
          }

          if (active) {
            const role = user?.role || null;
            setUserRole(role);
            setIsAdmin(role === "admin");
            setLoading(false);
          }
        } catch (error) {
          console.error("Setting check error:", error);
          if (active) {
            Alert.alert("Error", "An error occurred. Please try again.");
            navigation.goBack();
          }
        }
      })();
      return () => { active = false; };
    }, [navigation])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Access Denied</Text>
        <Text style={styles.errorSubText}>
          You need admin privileges to access this page.
        </Text>
        <Text style={styles.roleText}>Your role: {userRole || "Not assigned"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Admin Settings Page</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF3B30",
    marginBottom: 12,
  },
  errorSubText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  roleText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
});

export default Setting;