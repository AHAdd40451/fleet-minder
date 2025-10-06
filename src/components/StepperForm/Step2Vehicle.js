import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import Tesseract from "tesseract.js";

const Step2Vehicle = ({ data, setData, nextStep, prevStep }) => {
  const [vin, setVin] = useState(data.vin || "");
  const [make, setMake] = useState(data.make || "");
  const [model, setModel] = useState(data.model || "");
  const [year, setYear] = useState(data.year || "");
  const [mileage, setMileage] = useState(data.mileage || "");
  const [odometer, setOdometer] = useState(data.odometer || "");
  const [vinImages, setVinImages] = useState(data.vinImages || []);
  const [meterImages, setMeterImages] = useState(data.meterImages || []);
  const [loading, setLoading] = useState(false);

  const pickImages = async (setter, type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setter(prev => [...prev, ...newImages]);
        
        // Process the first image for OCR if it's a new image
        if (newImages.length > 0) {
          const firstImage = newImages[0];
          if (type === "vin") {
            await extractVin(firstImage);
          } else if (type === "meter") {
            await extractOdometer(firstImage);
          }
        }
      }
    } catch (err) {
      console.error("Error picking images:", err);
      Alert.alert("Error", "Failed to open image library");
    }
  };

  const removeImage = (imageUri, setter) => {
    setter(prev => prev.filter(uri => uri !== imageUri));
  };

  const getBase64 = async (imageUri) => {
    if (Platform.OS === "web") {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onerror = reject;
        reader.onload = () => {
          const dataUrl = reader.result;
          const base64 = dataUrl.split(",")[1];
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });
    } else {
      return await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64",
      });
    }
  };

  const extractVin = async (imageUri) => {
    try {
      setLoading(true);
      const b64 = await getBase64(imageUri);
      const buffer = `data:image/jpeg;base64,${b64}`;

      const { data: { text } } = await Tesseract.recognize(buffer, "eng", {
        logger: (m) => console.log("VIN OCR:", m),
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        psm: Tesseract.PSM.SINGLE_LINE,
      });

      console.log("VIN OCR raw:", text);

      const clean = text.replace(/\s+/g, "").toUpperCase();
      const vinMatch = clean.match(/[A-HJ-NPR-Z0-9]{17}/);
      if (vinMatch && vinMatch[0].length === 17) {
        const detected = vinMatch[0];
        setVin(detected);
        Alert.alert("VIN Detected", detected);
      }

      const yearMatch = text.match(/20\d{2}|19\d{2}/);
      if (yearMatch) setYear(yearMatch[0]);

      const makeMatch = text.match(
        /(TOYOTA|HONDA|FORD|CHEVROLET|BMW|NISSAN|TESLA|MERCEDES|HYUNDAI|KIA|VOLKSWAGEN|JEEP|DODGE)/i
      );
      if (makeMatch) setMake(makeMatch[0].toUpperCase());

      const modelMatch = text.match(
        /(CIVIC|COROLLA|CAMRY|F150|MODEL\s?3|ACCORD|ALTIMA|SONATA|TUCSON|GOLF|CHARGER|WRANGLER)/i
      );
      if (modelMatch) setModel(modelMatch[0].toUpperCase());
    } catch (err) {
      console.error("Error in extractVin:", err);
      Alert.alert("Error", "Could not read VIN");
    } finally {
      setLoading(false);
    }
  };

  const extractOdometer = async (imageUri) => {
    try {
      setLoading(true);
      const b64 = await getBase64(imageUri);
      const buffer = `data:image/jpeg;base64,${b64}`;

      const { data: { text } } = await Tesseract.recognize(buffer, "eng", {
        logger: (m) => console.log("Odometer OCR:", m),
        tessedit_char_whitelist: "0123456789",
        psm: Tesseract.PSM.SINGLE_LINE,
      });

      console.log("Odometer OCR raw:", text);

      const justDigits = text.replace(/\D/g, "");
      const match = justDigits.match(/\d{4,7}/);
      if (match) {
        const reading = match[0];
        setOdometer(reading);
        setMileage(reading);
        Alert.alert("Odometer Detected", reading);
      } else {
        Alert.alert(
          "No Reading Found",
          "Could not detect a valid odometer value. Try clearer image."
        );
      }
    } catch (err) {
      console.error("Error in extractOdometer:", err);
      Alert.alert("Error", "Could not read odometer");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setData({
      vin,
      make,
      model,
      year,
      mileage,
      odometer,
      vinImages,
      meterImages,
    });
    nextStep();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vehicle Information</Text>

      <TextInput
        style={styles.input}
        placeholder="VIN"
        placeholderTextColor="#777"
        value={vin}
        onChangeText={setVin}
      />
      <TextInput
        style={styles.input}
        placeholder="Make"
        placeholderTextColor="#777"
        value={make}
        onChangeText={setMake}
      />
      <TextInput
        style={styles.input}
        placeholder="Model"
        placeholderTextColor="#777"
        value={model}
        onChangeText={setModel}
      />
      <TextInput
        style={styles.input}
        placeholder="Year"
        placeholderTextColor="#777"
        value={year}
        onChangeText={setYear}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Mileage"
        placeholderTextColor="#777"
        value={mileage}
        onChangeText={setMileage}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Odometer"
        placeholderTextColor="#777"
        value={odometer}
        onChangeText={setOdometer}
        keyboardType="numeric"
      />

      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>VIN Images</Text>
        <TouchableOpacity
          style={styles.addImageButton}
          onPress={() => pickImages(setVinImages, "vin")}
        >
          <Text style={styles.addImageText}>+ Add VIN Images</Text>
        </TouchableOpacity>
        {vinImages.length > 0 && (
          <View style={styles.imageGrid}>
            {vinImages.map((imageUri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.thumbnail} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(imageUri, setVinImages)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>Odometer Images</Text>
        <TouchableOpacity
          style={styles.addImageButton}
          onPress={() => pickImages(setMeterImages, "meter")}
        >
          <Text style={styles.addImageText}>+ Add Odometer Images</Text>
        </TouchableOpacity>
        {meterImages.length > 0 && (
          <View style={styles.imageGrid}>
            {meterImages.map((imageUri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.thumbnail} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(imageUri, setMeterImages)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {loading && <ActivityIndicator color="#fff" style={{ marginTop: 10 }} />}

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.btn} onPress={prevStep}>
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={handleNext}>
          <Text style={styles.btnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { color: "#fff", fontSize: 22, marginBottom: 20 },
  input: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  imageSection: {
    marginVertical: 15,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  addImageButton: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#555",
    borderStyle: "dashed",
  },
  addImageText: {
    color: "#fff",
    fontSize: 14,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imageContainer: {
    position: "relative",
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  btn: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    width: "48%",
  },
  btnText: { textAlign: "center", color: "#000", fontWeight: "bold" },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default Step2Vehicle;
