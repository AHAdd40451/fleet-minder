import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

const StepIndicator = ({ step }) => (
  <View style={styles.wrapper}>
    {[1, 2, 3].map((s, idx) => {
      const isActive = step >= s;
      const isCompleted = step > s;
      const isCurrent = step === s;

      return (
        <View key={s} style={styles.stepItem}>
          <View style={[
            styles.circle, 
            isActive && styles.activeCircle,
            isCurrent && styles.currentCircle,
            isCompleted && styles.completedCircle
          ]}>
            {isCompleted ? (
              <Text style={styles.checkmark}>✓</Text>
            ) : (
              <Text style={[
                styles.text, 
                isActive && styles.activeText,
                isCurrent && styles.currentText
              ]}>
                {s}
              </Text>
            )}
          </View>

          {idx < 2 && (
            <View style={[
              styles.line, 
              isCompleted && styles.lineActive,
              isActive && styles.lineProgress
            ]} />
          )}
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 40,
    paddingHorizontal: 20,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    shadowColor: "#fff",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    position: "relative",
    zIndex: 2,
  },
  activeCircle: {
    backgroundColor: "#fff",
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 12,
  },
  currentCircle: {
    borderColor: "#fff",
    borderWidth: 4,
    shadowColor: "#fff",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 15,
  },
  completedCircle: {
    backgroundColor: "#000",
    borderColor: "#fff",
    borderWidth: 3,
  },
  text: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
    textAlign: "center",
  },
  activeText: {
    color: "#000",
    fontWeight: "900",
  },
  currentText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 20,
  },
  checkmark: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  line: {
    width: 80,
    height: 4,
    backgroundColor: "#333",
    marginHorizontal: 10,
    borderRadius: 2,
    position: "relative",
    zIndex: 1,
  },
  lineActive: {
    backgroundColor: "#fff",
    shadowColor: "#fff",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  lineProgress: {
    backgroundColor: "#666",
  },
});

export default StepIndicator;
