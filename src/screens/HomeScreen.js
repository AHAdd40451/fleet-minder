import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { GlassCard, GlassButton } from '../components';
import theme from '../styles/theme';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.background}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to GlassyApp</Text>
            <Text style={styles.subtitle}>
              Beautiful glassy UI with React Native & Expo
            </Text>
          </View>

          <View style={styles.cardsContainer}>
            <GlassCard style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Feature 1</Text>
                <Text style={styles.cardDescription}>
                  This is a beautiful glassy card component with blur effects
                  and gradient backgrounds.
                </Text>
                <GlassButton 
                  title="Learn More" 
                  variant="primary"
                  size="small"
                  onPress={() => console.log('Button pressed!')}
                />
              </View>
            </GlassCard>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl * 2,
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
  cardsContainer: {
    gap: theme.spacing.lg,
  },
  card: {
    minHeight: 200,
  },
  cardContent: {
    padding: theme.spacing.lg,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
});

export default HomeScreen;