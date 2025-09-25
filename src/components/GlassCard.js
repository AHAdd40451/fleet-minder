import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../styles/theme';

const GlassCard = ({ 
  children, 
  style, 
  intensity = 20, 
  gradient = theme.colors.background.primary,
  borderRadius = theme.radius.lg,
  ...props 
}) => {
  return (
    <View style={[styles.container, { borderRadius }, style]} {...props}>
      <LinearGradient
        colors={gradient}
        style={[styles.gradient, { borderRadius }]}
      >
        <BlurView
          intensity={intensity}
          style={[styles.blur, { borderRadius }]}
        >
          <View style={[styles.content, { borderRadius }]}>
            {children}
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  gradient: {
    flex: 1,
  },
  blur: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: theme.glass.medium.backgroundColor,
    borderWidth: 1,
    borderColor: theme.glass.medium.borderColor,
  },
});

export default GlassCard;