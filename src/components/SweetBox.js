import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

const { width } = Dimensions.get('window');

const SweetBox = ({
  visible = false,
  type = 'info', // 'success', 'error', 'warning', 'info'
  title = '',
  message = '',
  confirmText = 'OK',
  onConfirm = () => {},
  onClose = () => {},
  autoClose = true,
  autoCloseDelay = 3000,
  icon = null,
  style = {},
  titleStyle = {},
  messageStyle = {},
  buttonStyle = {},
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      showAlert();
    } else {
      hideAlert();
    }
  }, [visible]);

  const showAlert = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    if (autoClose) {
      setTimeout(() => {
        hideAlert();
      }, autoCloseDelay);
    }
  };

  const hideAlert = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getAlertConfig = () => {
    const configs = {
      success: {
        icon: 'checkmark-circle',
        iconColor: '#22c55e', // Green color
        gradient: ['#ffffff', '#f8f9fa'], // White gradient
      },
      error: {
        icon: 'close-circle',
        iconColor: '#ef4444', // Red color
        gradient: ['#ffffff', '#f8f9fa'], // White gradient
      },
      warning: {
        icon: 'warning',
        iconColor: '#000000', // Black color
        gradient: ['#ffffff', '#f8f9fa'], // White gradient
      },
      info: {
        icon: 'information-circle',
        iconColor: '#000000', // Black color
        gradient: ['#ffffff', '#f8f9fa'], // White gradient
      },
    };

    return configs[type] || configs.info;
  };

  const config = getAlertConfig();

  const handleConfirm = () => {
    onConfirm();
    hideAlert();
  };

  const handleOverlayPress = () => {
    hideAlert();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleOverlayPress}
    >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
                style,
              ]}
            >
              <LinearGradient
                colors={config.gradient}
                style={styles.gradient}
              >
                <BlurView intensity={20} style={styles.blur}>
                  <View style={styles.content}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={icon || config.icon}
                        size={40}
                        color={config.iconColor}
                      />
                    </View>

                    {/* Title */}
                    {title && (
                      <Text style={[styles.title, { color: config.iconColor }, titleStyle]}>
                        {title}
                      </Text>
                    )}

                    {/* Message */}
                    {message && (
                      <Text style={[styles.message, messageStyle]}>
                        {message}
                      </Text>
                    )}

                    {/* Button */}
                    <TouchableOpacity
                      style={[
                        styles.button,
                        { backgroundColor: config.iconColor },
                        buttonStyle,
                      ]}
                      onPress={handleConfirm}
                    >
                      <Text style={styles.buttonText}>{confirmText}</Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </LinearGradient>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.8,
    maxWidth: 350,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.large,
  },
  gradient: {
    flex: 1,
  },
  blur: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: theme.radius.lg,
  },
  iconContainer: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.typography.fontSizes.md,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    ...theme.shadows.small,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
});

// Static methods for easy usage
SweetBox.success = (props) => <SweetBox {...props} type="success" />;
SweetBox.error = (props) => <SweetBox {...props} type="error" />;
SweetBox.warning = (props) => <SweetBox {...props} type="warning" />;
SweetBox.info = (props) => <SweetBox {...props} type="info" />;

export default SweetBox;
