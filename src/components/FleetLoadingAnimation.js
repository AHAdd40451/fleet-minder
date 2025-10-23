import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const FleetLoadingAnimation = () => {
  return (
    <View style={styles.container}>
      <DotLottieReact
        src="https://lottie.host/d9b46c45-2792-4ba1-a3a0-0ff7c60615b7/gV1SHE5vIU.lottie"
        loop
        autoplay
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
});

export default FleetLoadingAnimation;
