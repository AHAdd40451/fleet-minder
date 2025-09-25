import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import theme from '../styles/theme';

const GlassInput = ({ 
  placeholder, 
  value, 
  onChangeText, 
  style, 
  inputStyle,
  secureTextEntry = false,
  ...props 
}) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={10} style={styles.blur}>
        <View style={styles.content}>
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={theme.colors.text.muted}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            style={[styles.input, inputStyle]}
            {...props}
          />
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  blur: {
    flex: 1,
  },
  content: {
    backgroundColor: theme.glass.light.backgroundColor,
    borderWidth: 1,
    borderColor: theme.glass.light.borderColor,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  input: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.primary,
    minHeight: 44,
  },
});

export default GlassInput;