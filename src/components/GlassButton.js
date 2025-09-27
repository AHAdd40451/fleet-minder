import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../styles/theme';

const GlassButton = ({ 
  title, 
  onPress, 
  style, 
  textStyle,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          gradient: theme.colors.background.secondary,
          text: theme.colors.text.primary,
        };
      case 'accent':
        return {
          gradient: [theme.colors.accent.cyan, theme.colors.accent.emerald],
          text: theme.colors.text.light,
        };
      default:
        return {
          gradient: theme.colors.background.primary,
          text: theme.colors.text.primary,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          fontSize: theme.typography.fontSizes.sm,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
          fontSize: theme.typography.fontSizes.lg,
        };
      default:
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          fontSize: theme.typography.fontSizes.md,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      style={[styles.container, style]}
      activeOpacity={0.8}
      {...props}
    >
      <LinearGradient
        colors={variantStyles.gradient}
        style={styles.gradient}
      >
        <BlurView intensity={15} style={styles.blur}>
          <View style={[
            styles.content, 
            { 
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
            },
            disabled && styles.disabled
          ]}>
            <Text style={[
              styles.text, 
              { 
                color: variantStyles.text,
                fontSize: sizeStyles.fontSize,
              },
              textStyle
            ]}>
              {title}
            </Text>
          </View>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  blur: {
    flex: 1,
  },
  content: {
    backgroundColor: theme.glass.light.backgroundColor,
    borderWidth: 1,
    borderColor: theme.glass.light.borderColor,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: theme.typography.fontWeights.semibold,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GlassButton;