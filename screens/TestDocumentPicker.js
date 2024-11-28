import React from "react";
import { View, Button, StyleSheet, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";

const TestDocumentPicker = () => {
  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/epub+zip", "application/pdf"], // Allow specific file types
      });

      // Log the full result object
      console.log("DocumentPicker result:", result);

      // Display a simple alert with key details
      if (result.assets) {
        Alert.alert(
          "File Selected",
          `Name: ${result.assets[0]?.name}\nType: ${result.assets[0]?.type}\nURI: ${result.assets[0]?.uri}`
        );
      } else if (result.canceled) {
        Alert.alert("Picker Canceled");
      } else {
        Alert.alert("Unexpected result structure", JSON.stringify(result));
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick a Document" onPress={handleFileSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TestDocumentPicker;
