import React from "react";
import { View, Text, StyleSheet } from "react-native";

const StepIndicator = ({ step }) => (
  <View style={styles.wrapper}>
    {[1, 2, 3].map((s, idx) => (
      <View key={s} style={styles.stepItem}>
        <View style={[styles.circle, step >= s && styles.active]}>
          <Text style={[styles.text, step >= s && styles.activeText]}>{s}</Text>
        </View>
        {idx < 2 && (
          <View style={[styles.line, step > s && styles.lineActive]} />
        )}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  wrapper: { flexDirection: "row", justifyContent: "center", marginVertical: 20 },
  stepItem: { flexDirection: "row", alignItems: "center" },
  circle: { width: 35, height: 35, borderRadius: 18, borderWidth: 1, borderColor: "#888", alignItems: "center", justifyContent: "center", marginHorizontal: 10 },
  active: { backgroundColor: "#fff", borderColor: "#fff" },
  text: { color: "#fff" },
  activeText: { color: "#000" },
  line: { width: 30, height: 1, backgroundColor: "#888", alignSelf: "center", marginHorizontal: 10 },
  lineActive: { backgroundColor: "#fff" },
});

export default StepIndicator;
