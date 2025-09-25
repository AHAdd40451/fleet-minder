import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { GlassCard, GlassButton, GlassInput } from '../components';
import theme from '../styles/theme';

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return;
    }
    
    setLoading(true);
    // Add your Supabase signup logic here
    console.log('Signup attempt:', { email, password });
    setLoading(false);
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.background}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Join GlassyApp</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <GlassCard style={styles.formCard}>
            <View style={styles.form}>
              <Text style={styles.formTitle}>Sign Up</Text>
              
              <View style={styles.inputContainer}>
                <GlassInput
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <GlassInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <GlassInput
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <GlassButton
                title={loading ? "Creating Account..." : "Create Account"}
                onPress={handleSignup}
                disabled={loading}
                variant="primary"
                size="large"
                style={styles.signupButton}
              />

              <View style={styles.loginPrompt}>
                <Text style={styles.loginText}>
                  Already have an account?{' '}
                </Text>
                <GlassButton
                  title="Sign In"
                  onPress={navigateToLogin}
                  variant="secondary"
                  size="small"
                />
              </View>
            </View>
          </GlassCard>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.light,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text.light,
    textAlign: 'center',
    opacity: 0.8,
  },
  formCard: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  form: {
    padding: theme.spacing.xl,
  },
  formTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: 0,
  },
  signupButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  loginText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default SignupScreen;