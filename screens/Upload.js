import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { db, storage, auth } from "../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import ePub from "epubjs";

const Upload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async () => {
    try {
      const response = await DocumentPicker.getDocumentAsync({
        type: ["application/epub+zip", "application/pdf"],
      });

      if (response.canceled) {
        setFile(null);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const selectedFile = response.assets[0];
        setFile(selectedFile);
        console.log("Selected file:", selectedFile);
      } else {
        Alert.alert("Error", "No file selected or invalid file.");
        setFile(null);
      }
    } catch (error) {
      Alert.alert("Error selecting file", error.message);
      setFile(null);
    }
  };

  const getMetadata = async (fileUri) => {
    try {
      const book = ePub(fileUri);
      const metadata = await book.loaded.metadata;
      return metadata;
    } catch (error) {
      console.error("Error fetching metadata:", error);
      return null;
    }
  };

  const getEpubCover = async (fileUri) => {
    try {
      const book = ePub(fileUri);
      await book.ready;

      // get cover from resources
      try {
        const cover = await book.loaded.cover;
        if (cover) {
          const coverUrl = await book.archive.createUrl(cover, {
            base64: true, // book.loaded.cover convert to url
          });
          return coverUrl;
        }
      } catch (e) {
        console.log("Method 1 failed:", e);
      }

      // from spine toc
      try {
        const spine = await book.loaded.spine;
        const coverItem = spine.find(
          (item) =>
            item.href.toLowerCase().includes("cover") ||
            item.id?.toLowerCase().includes("cover")
        );

        if (coverItem) {
          const coverUrl = await book.archive.createUrl(coverItem.href, {
            base64: true,
          });
          return coverUrl;
        }
      } catch (e) {
        console.log("Method 2 failed:", e);
      }

      // first image of the book
      try {
        const resources = await book.loaded.resources;
        const firstImage = resources.find((item) =>
          item.type?.includes("image")
        );

        if (firstImage) {
          const coverUrl = await book.archive.createUrl(firstImage.href, {
            base64: true,
          });
          return coverUrl;
        }
      } catch (e) {
        console.log("Method 3 failed:", e);
      }

      return null;
    } catch (error) {
      console.error("Error with EPUB handling:", error);
      return null;
    }
  };

  const extractImagesFromEpub = async (fileUri) => {
    try {
      const book = ePub(fileUri);
      await book.ready;
      const sections = await book.loaded.spine;

      for (let section of sections) {
        try {
          const content = await book.archive.getText(section.href);
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, "text/html");
          const imgElement = doc.querySelector("img");

          if (imgElement && imgElement.getAttribute("src")) {
            const imageUrl = await book.archive.createUrl(
              imgElement.getAttribute("src"),
              {
                base64: true,
              }
            );
            return imageUrl;
          }
        } catch (e) {
          console.log("Error processing section:", e);
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error("Error extracting images:", error);
      return null;
    }
  };

  const uploadFile = async () => {
    if (!file) {
      Alert.alert("No file selected", "Please select a file to upload.");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert(
        "Error",
        "No user is logged in. Please log in and try again."
      );
      return;
    }

    const userID = currentUser.uid;
    const filePath = `users/${userID}/${file.name}`;

    try {
      const fileBlob = await fetch(file.uri).then((res) => res.blob());
      setUploading(true);
      setProgress(0);

      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, fileBlob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const uploadProgress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(uploadProgress);
        },
        (error) => {
          setUploading(false);
          Alert.alert("Upload failed", error.message);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          try {
            const metadata = await getMetadata(file.uri);
            console.log("Got metadata:", metadata);

            let coverUrl = await getEpubCover(file.uri);
            if (!coverUrl) {
              console.log("Trying alternative image extraction...");
              coverUrl = await extractImagesFromEpub(file.uri);
            }
            console.log("Final cover URL:", coverUrl ? "Found" : "Not found");

            await addDoc(collection(db, `users/${userID}/uploads`), {
              name: file.name,
              path: filePath,
              uri: downloadURL,
              uploadedAt: new Date(),
              type: file.mimeType,
              size: file.size,
              coverUrl: coverUrl,
              metadata: metadata || { title: "Unknown", creator: "Unknown" },
            });

            setUploading(false);
            setProgress(0);
            setFile(null);

            setTimeout(() => {
              if (onUploadSuccess) {
                console.log("Triggering upload success callback");
                onUploadSuccess();
              }
            }, 500);

            Alert.alert("Success", "File uploaded successfully");
          } catch (error) {
            setUploading(false);
            Alert.alert("Failed to save metadata", error.message);
          }
        }
      );
    } catch (error) {
      setUploading(false);
      Alert.alert("Error preparing upload", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={file ? uploadFile : handleFileSelect}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Icon
            name={file ? "cloud-upload-outline" : "document-outline"}
            size={24}
            color="#FFFFFF"
          />
        )}
      </TouchableOpacity>
      {file && (
        <Text style={styles.fileNameText} numberOfLines={1}>
          {file.name}
        </Text>
      )}
      {uploading && (
        <Text style={styles.progressText}>
          Uploading... {progress.toFixed(0)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 10,
  },
  uploadButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  progressText: {
    marginTop: 10,
    color: "#007bff",
    fontSize: 14,
  },
  fileNameText: {
    marginTop: 10,
    color: "#007bff",
    fontSize: 12,
    maxWidth: 200,
  },
});

export default Upload;
