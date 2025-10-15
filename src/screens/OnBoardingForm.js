import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import StepIndicator from "../components/StepperForm/StepIndicator";
import Step1Company from "../components/StepperForm/Step1Company";
import Step2Vehicle from "../components/StepperForm/Step2Vehicle";
import Step3OTP from "../components/StepperForm/Step3OTP";


const OnboardingForm = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [companyData, setCompanyData] = useState({});
  const [vehicleData, setVehicleData] = useState({});
  const [userData, setUserData] = useState({});
  const [checking, setChecking] = useState(true);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        try {
          const flag = await AsyncStorage.getItem("isOnboardingComplete");
          if (active && flag === "true") {
            navigation.reset({ index: 0, routes: [{ name: "Home" }] });
            return;
          }
        } catch (_) {}
        if (active) setChecking(false);
      })();
      return () => { active = false; };
    }, [navigation])
  );

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StepIndicator step={step} />
      {step === 1 && (
        <Step1Company
          data={companyData}
          setData={setCompanyData}
          nextStep={nextStep}
        />
      )}
      {step === 2 && (
        <Step2Vehicle
          companyData={companyData}
          data={vehicleData}
          setData={setVehicleData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
      {step === 3 && (
        <Step3OTP
          companyData={companyData}
          vehicleData={vehicleData}
          userData={userData}
          setUserData={setUserData}
          prevStep={prevStep}
          navigation={navigation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
});

export default OnboardingForm;
