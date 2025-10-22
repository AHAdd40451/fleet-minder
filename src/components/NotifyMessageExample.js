import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import NotifyMessage from './NotifyMessage';
import GlassButton from './GlassButton';

const NotifyMessageExample = () => {
  const [alerts, setAlerts] = useState({
    success: false,
    error: false,
    warning: false,
    info: false,
    confirm: false,
  });

  const showAlert = (type) => {
    setAlerts(prev => ({ ...prev, [type]: true }));
  };

  const hideAlert = (type) => {
    setAlerts(prev => ({ ...prev, [type]: false }));
  };

  return (
    <View style={styles.container}>
      {/* Success Alert */}
      <GlassButton
        title="Show Success Alert"
        onPress={() => showAlert('success')}
        style={styles.button}
      />

      {/* Error Alert */}
      <GlassButton
        title="Show Error Alert"
        onPress={() => showAlert('error')}
        variant="secondary"
        style={styles.button}
      />

      {/* Warning Alert */}
      <GlassButton
        title="Show Warning Alert"
        onPress={() => showAlert('warning')}
        variant="accent"
        style={styles.button}
      />

      {/* Info Alert */}
      <GlassButton
        title="Show Info Alert"
        onPress={() => showAlert('info')}
        style={styles.button}
      />

      {/* Confirm Alert */}
      <GlassButton
        title="Show Confirm Alert"
        onPress={() => showAlert('confirm')}
        style={styles.button}
      />

      {/* Alert Components */}
      <NotifyMessage
        visible={alerts.success}
        type="success"
        title="Success!"
        message="Your action was completed successfully."
        onClose={() => hideAlert('success')}
        onConfirm={() => {
          console.log('Success confirmed');
          hideAlert('success');
        }}
      />

      <NotifyMessage
        visible={alerts.error}
        type="error"
        title="Error!"
        message="Something went wrong. Please try again."
        onClose={() => hideAlert('error')}
        onConfirm={() => {
          console.log('Error acknowledged');
          hideAlert('error');
        }}
      />

      <NotifyMessage
        visible={alerts.warning}
        type="warning"
        title="Warning!"
        message="Please check your input before proceeding."
        onClose={() => hideAlert('warning')}
        onConfirm={() => {
          console.log('Warning acknowledged');
          hideAlert('warning');
        }}
      />

      <NotifyMessage
        visible={alerts.info}
        type="info"
        title="Information"
        message="Here's some useful information for you."
        onClose={() => hideAlert('info')}
        onConfirm={() => {
          console.log('Info acknowledged');
          hideAlert('info');
        }}
      />

      <NotifyMessage
        visible={alerts.confirm}
        type="confirm"
        title="Confirm Action"
        message="Are you sure you want to proceed with this action?"
        confirmText="Yes, Continue"
        cancelText="Cancel"
        showCancel={true}
        onClose={() => hideAlert('confirm')}
        onConfirm={() => {
          console.log('Action confirmed');
          hideAlert('confirm');
        }}
        onCancel={() => {
          console.log('Action cancelled');
          hideAlert('confirm');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  button: {
    width: '100%',
    marginVertical: 8,
  },
});

export default NotifyMessageExample;
