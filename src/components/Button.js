import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../styles/theme';

const { width } = Dimensions.get('window');

const Button = ({ 
  title, 
  onPress, 
  style, 
  textStyle,
  variant = 'white',
  disabled = false,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'green':
        return {
          gradient: ['rgba(16, 185, 129, 0.8)', 'rgba(5, 150, 105, 0.9)'],
          text: theme.colors.text.light,
          borderColor: 'rgba(16, 185, 129, 0.3)',
        };
      case 'red':
        return {
          gradient: ['rgba(244, 63, 94, 0.8)', 'rgba(220, 38, 38, 0.9)'],
          text: theme.colors.text.light,
          borderColor: 'rgba(244, 63, 94, 0.3)',
        };
            case 'black': 
      case 'black':
  return {
    gradient: ['#000000', '#000000'], // solid black
    text: theme.colors.text.light,    // white text
    borderColor: '#000000',           // black border
  };
      default: // white
        return {
          gradient: ['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.95)'],
          text: theme.colors.text.primary,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        };
    }
  };

  const getResponsivePadding = () => {
    // Small screens (width < 768px) - 16px padding
    // Medium, Large, XL screens (width >= 768px) - 24px padding
    if (width < 768) {
      return {
        paddingVertical: 12,
        paddingHorizontal: 16,
        minHeight: 44,
      };
    } else {
      return {
        paddingVertical: 12,
        paddingHorizontal: 24,
        minHeight: 48,
      };
    }
  };

  const variantStyles = getVariantStyles();
  const paddingStyles = getResponsivePadding();

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
              paddingVertical: paddingStyles.paddingVertical,
              paddingHorizontal: paddingStyles.paddingHorizontal,
              minHeight: paddingStyles.minHeight,
              borderColor: variantStyles.borderColor,
            },
            disabled && styles.disabled
          ]}>
            <Text style={[
              styles.text, 
              { 
                color: variantStyles.text,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: theme.typography.fontWeights.semibold,
    textAlign: 'center',
    fontSize: theme.typography.fontSizes.md,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
