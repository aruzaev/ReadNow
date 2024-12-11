import React, { useState, useRef } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { Reader, useReader } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";

const ReaderScreen = ({ route }) => {
  const { book } = route.params;
  const readerRef = useRef(null); // Reference for Reader
  const { goPrevious, goNext } = useReader(); // Access navigation methods
  const [loadingProgress, setLoadingProgress] = useState(0);

  const bookUri = book.uri;

  if (!bookUri) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error: Book URI is missing or invalid.
        </Text>
      </View>
    );
  }

  const handlePrevious = () => {
    if (goPrevious) {
      goPrevious();
    } else {
      console.log("goPrevious function is not available");
    }
  };

  const handleNext = () => {
    if (goNext) {
      goNext();
    } else {
      console.log("goNext function is not available");
    }
  };

  return (
    <View style={styles.container}>
      <Reader
        ref={readerRef}
        src={bookUri}
        fileSystem={useFileSystem}
        onReady={() => console.log("EPUB book is ready to read")}
        onLocationChange={(location) =>
          console.log("Current Location:", location)
        }
        onProgress={(progress) => {
          console.log("Loading Progress:", progress);
          setLoadingProgress(progress);
        }}
        onDisplayError={(err) => console.error("Error displaying book:", err)}
        renderLoadingFileComponent={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading book...</Text>
          </View>
        )}
      />
      {loadingProgress < 1 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {Math.round(loadingProgress * 100)}% loaded
          </Text>
        </View>
      )}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={handlePrevious} style={styles.button}>
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.button}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 16,
    paddingHorizontal: 20,
    textAlign: "center",
  },
  progressContainer: {
    position: "absolute",
    bottom: 50,
    left: 10,
    right: 10,
  },
  progressText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 5,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 10,
    width: "100%",
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default ReaderScreen;
