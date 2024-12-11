import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ProgressBarAndroid,
  ProgressBarAndroidBase,
  ProgressBarAndroidComponent,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { db, storage, auth } from "../firebase/firebaseConfig";
import { collection, addDoc, setDoc } from "firebase/firestore";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { UserContext } from "../UserContext";
import ePub from "epubjs";

// 108383805851025218741

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { user } = useContext(UserContext);
  const currentUser = user || auth.currentUser;

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>
          You need to be logged in to upload files.
        </Text>
      </View>
    );
  }
  const userID = currentUser.uid;
  console.log("User context", userID);

  const handleFileSelect = async () => {
    try {
      const response = await DocumentPicker.getDocumentAsync({
        type: ["application/epub+zip", "application/pdf"],
      });

      if (response.canceled) {
        setFile(null);
      } else if (response.assets) {
        const selectedFile = response.assets[0];
        setFile(selectedFile);
        console.log("Selected file details: ", selectedFile);
      } else {
        Alert.alert("Something unexpected happened...");
      }
    } catch (error) {
      Alert.alert(`An error has occurred: ${error}`);
    }
  };

  const getMetadata = async (fileUri) => {
    try {
      const book = ePub(fileUri);
      const metadata = await book.loaded.metadata;
      return metadata;
    } catch (error) {
      console.error("Error getting the EPUB metadata", error);
      return null;
    }
  };

  const uploadFile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Error", "No one is logged in. Please log in and try again");
      return;
    }

    const userID = currentUser.uid;
    const filePath = `users/${userID}/${file.name}`;

    if (!file) {
      Alert.alert("No file selected", "Please select a file to upload");
      return;
    }

    setUploading(true);
    setProgress(0);

    // creating a pointer to the file we want to work on in the cloud
    const storageRef = ref(storage, filePath);
    // converting file object (just has the metadata and reference that we got from DocumentPicker)
    // to blob, which can actually hold binary data (the actual file)
    const fileBlob = await fetch(file.uri).then((res) => res.blob());

    const uploadTask = uploadBytesResumable(storageRef, fileBlob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        setUploading(false);
        Alert.alert("Uploading failed", error.message);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        const metadata = await getMetadata(file.uri);

        console.log("Metadata", metadata);

        try {
          console.log("User ID:", userID);
          console.log("Firestore Path: users/" + userID + "/uploads");

          await addDoc(collection(db, `users/${userID}/uploads`), {
            name: file.name,
            path: filePath,
            uri: downloadURL,
            uploadedAt: new Date(),
            type: file.mimeType,
            size: file.size,
            metadata: metadata || { title: "Unknown", author: "Unknown" },
          });
          setUploading(false);
          setFile(null);
          setProgress(0);
          Alert.alert("File uploaded successfully");
        } catch (error) {
          setUploading(false);
          Alert.alert("Error saving metadata", error.message);
          console.log("Error saving to firestore", error);
        }
      }
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Your File</Text>

      <TouchableOpacity style={styles.button} onPress={handleFileSelect}>
        <Text style={styles.buttonText}>
          {file ? `Selected: ${file.name}` : "Select a File"}
        </Text>
      </TouchableOpacity>

      {file && !uploading && (
        <TouchableOpacity style={styles.button} onPress={uploadFile}>
          <Text style={styles.buttonText}>Upload File</Text>
        </TouchableOpacity>
      )}

      {uploading && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.progressText}>
            Uploading... {progress.toFixed(2)}%
          </Text>
          <ProgressBarAndroid
            styleAttr="Horizontal"
            indeterminate={false}
            progress={progress / 100}
            color="#007bff"
          />
        </View>
      )}

      {!file && !uploading && (
        <Text style={styles.placeholderText}>No file selected</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    marginVertical: 20,
    alignItems: "center",
    width: "80%",
  },
  progressText: {
    fontSize: 16,
    marginVertical: 8,
    color: "#333",
  },
  placeholderText: {
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
});

export default Upload;
