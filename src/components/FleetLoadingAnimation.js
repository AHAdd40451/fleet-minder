import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const FleetLoadingAnimation = ({ text = "Loading Dashboard..." }) => {
  const carPosition = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const dotAnimation1 = useRef(new Animated.Value(0)).current;
  const dotAnimation2 = useRef(new Animated.Value(0)).current;
  const dotAnimation3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start fade in animation
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Create the moving car animation
    const moveCar = () => {
      Animated.sequence([
        Animated.timing(carPosition, {
          toValue: width - 100, // Move from left to right
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(carPosition, {
          toValue: 0, // Reset to start position
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => moveCar()); // Loop the animation
    };

    // Create the pulsing animation for the loading text
    const pulseText = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => pulseText()); // Loop the animation
    };

    // Create staggered dot animations
    const animateDots = () => {
      const createDotAnimation = (dotRef, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dotRef, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dotRef, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      Animated.parallel([
        createDotAnimation(dotAnimation1, 0),
        createDotAnimation(dotAnimation2, 200),
        createDotAnimation(dotAnimation3, 400),
      ]).start();
    };

    moveCar();
    pulseText();
    animateDots();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnimation }]}>
      {/* Fleet branding header */}
      <View style={styles.brandHeader}>
        <Text style={styles.brandText}>Fleet Minder</Text>
        <Text style={styles.brandSubtext}>Managing your fleet assets</Text>
      </View>

      {/* Road/Line background */}
      {/* <View style={styles.roadContainer}>
        <View style={styles.roadDashes}>
          {[...Array(8)].map((_, index) => (
            <View key={index} style={styles.roadDash} />
          ))}
        </View>
      </View> */}

      {/* Moving car icon */}
      <Animated.View style={[styles.carContainer, { transform: [{ translateX: carPosition }] }]}>
        <View style={styles.car}>
          <Text style={styles.carIcon}>🚗</Text>
        </View>
      </Animated.View>

      {/* Loading text with pulse animation */}
      {/* <Animated.View style={[styles.textContainer, { transform: [{ scale: pulseAnimation }] }]}>
        <Text style={styles.loadingText}>{text}</Text>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dotAnimation1 }]} />
          <Animated.View style={[styles.dot, { opacity: dotAnimation2 }]} />
          <Animated.View style={[styles.dot, { opacity: dotAnimation3 }]} />
        </View>
      </Animated.View> */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 20,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },
  brandSubtext: {
    color: '#b0b0b0',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  roadContainer: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  roadLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  roadDashes: {
    position: 'absolute',
    width: '100%',
    height: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roadDash: {
    width: 20,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1,
  },
  carContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
  },
  car: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  carIcon: {
    fontSize: 24,
  },
  textContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E676',
    marginHorizontal: 4,
  },
});

export default FleetLoadingAnimation;
