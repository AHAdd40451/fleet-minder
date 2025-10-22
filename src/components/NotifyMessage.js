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

const { width, height } = Dimensions.get('window');

const NotifyMessage = ({
  visible = false,
  type = 'info', // 'success', 'error', 'warning', 'info', 'confirm'
  title = '',
  message = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm = () => {},
  onCancel = () => {},
  onClose = () => {},
  showCancel = false,
  autoClose = true,
  autoCloseDelay = 3000,
  icon = null,
  customIcon = null,
  style = {},
  titleStyle = {},
  messageStyle = {},
  buttonStyle = {},
  overlayStyle = {},
  animationType = 'fade', // 'fade', 'slide', 'bounce'
  position = 'center', // 'center', 'top', 'bottom'
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [slideAnim] = useState(new Animated.Value(height));

  useEffect(() => {
    if (visible) {
      showAlert();
    } else {
      hideAlert();
    }
  }, [visible]);

  const showAlert = () => {
    const animations = [];

    if (animationType === 'fade') {
      animations.push(
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      );
    } else if (animationType === 'slide') {
      animations.push(
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      );
    } else if (animationType === 'bounce') {
      animations.push(
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();

    if (autoClose && type !== 'confirm') {
      setTimeout(() => {
        hideAlert();
      }, autoCloseDelay);
    }
  };

  const hideAlert = () => {
    const animations = [];

    if (animationType === 'fade') {
      animations.push(
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      );
    } else if (animationType === 'slide') {
      animations.push(
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200,
          useNativeDriver: true,
        })
      );
    } else if (animationType === 'bounce') {
      animations.push(
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start(() => {
      onClose();
    });
  };

  const getAlertConfig = () => {
    const configs = {
      success: {
        icon: 'checkmark-circle',
        iconColor: theme.colors.accent.emerald,
        gradient: [theme.colors.accent.emerald, theme.colors.accent.cyan],
        glassColor: theme.glass.light,
      },
      error: {
        icon: 'close-circle',
        iconColor: theme.colors.accent.rose,
        gradient: [theme.colors.accent.rose, theme.colors.secondary[700]],
        glassColor: theme.glass.light,
      },
      warning: {
        icon: 'warning',
        iconColor: theme.colors.accent.amber,
        gradient: [theme.colors.accent.amber, theme.colors.primary[600]],
        glassColor: theme.glass.light,
      },
      info: {
        icon: 'information-circle',
        iconColor: theme.colors.primary[700],
        gradient: theme.colors.background.primary,
        glassColor: theme.glass.light,
      },
      confirm: {
        icon: 'help-circle',
        iconColor: theme.colors.primary[700],
        gradient: theme.colors.background.primary,
        glassColor: theme.glass.light,
      },
    };

    return configs[type] || configs.info;
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return {
          justifyContent: 'flex-start',
          paddingTop: 60,
        };
      case 'bottom':
        return {
          justifyContent: 'flex-end',
          paddingBottom: 60,
        };
      default:
        return {
          justifyContent: 'center',
        };
    }
  };

  const getAnimationStyle = () => {
    const baseStyle = {
      opacity: fadeAnim,
      transform: [
        { scale: scaleAnim },
        { translateY: slideAnim },
      ],
    };

    return baseStyle;
  };

  const config = getAlertConfig();
  const positionStyles = getPositionStyles();
  const animationStyle = getAnimationStyle();

  const handleConfirm = () => {
    onConfirm();
    if (type !== 'confirm') {
      hideAlert();
    }
  };

  const handleCancel = () => {
    onCancel();
    hideAlert();
  };

  const handleOverlayPress = () => {
    if (type === 'confirm') {
      handleCancel();
    } else {
      hideAlert();
    }
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
        <View style={[styles.overlay, overlayStyle]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                positionStyles,
                animationStyle,
                style,
              ]}
            >
              <LinearGradient
                colors={config.gradient}
                style={styles.gradient}
              >
                <BlurView intensity={20} style={styles.blur}>
                  <View style={[styles.content, { backgroundColor: config.glassColor.backgroundColor }]}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                      {customIcon || (
                        <Ionicons
                          name={icon || config.icon}
                          size={48}
                          color={config.iconColor}
                        />
                      )}
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

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                      {showCancel && (
                        <TouchableOpacity
                          style={[styles.button, styles.cancelButton, buttonStyle]}
                          onPress={handleCancel}
                        >
                          <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity
                        style={[
                          styles.button,
                          styles.confirmButton,
                          { backgroundColor: config.iconColor },
                          buttonStyle,
                        ]}
                        onPress={handleConfirm}
                      >
                        <Text style={styles.confirmButtonText}>{confirmText}</Text>
                      </TouchableOpacity>
                    </View>
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
    width: width * 0.85,
    maxWidth: 400,
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
    borderWidth: 1,
    borderColor: theme.glass.light.borderColor,
    borderRadius: theme.radius.lg,
  },
  iconContainer: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    ...theme.shadows.small,
  },
  cancelButton: {
    backgroundColor: theme.colors.neutral[200],
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
  },
  confirmButtonText: {
    color: theme.colors.text.light,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  cancelButtonText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
  },
});

// Static methods for easy usage
NotifyMessage.success = (props) => <NotifyMessage {...props} type="success" />;
NotifyMessage.error = (props) => <NotifyMessage {...props} type="error" />;
NotifyMessage.warning = (props) => <NotifyMessage {...props} type="warning" />;
NotifyMessage.info = (props) => <NotifyMessage {...props} type="info" />;
NotifyMessage.confirm = (props) => <NotifyMessage {...props} type="confirm" showCancel />;

export default NotifyMessage;
