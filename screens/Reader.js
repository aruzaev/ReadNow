import React, { useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Reader, useReader } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const ReaderScreen = ({ route }) => {
  const { book } = route.params;
  const readerRef = React.useRef(null);
  const { goPrevious, goNext, addAnnotation } = useReader();
  const navigation = useNavigation();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [highlights, setHighlights] = useState([]);

  const bookUri = book.uri;

  if (!bookUri) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error: Book URI is missing or invalid.
        </Text>
      </SafeAreaView>
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

  const handleHome = () => {
    navigation.navigate("Reading List");
  };

  const handleTextSelected = (selection) => {
    const { text, cfiRange } = selection;
    if (text && cfiRange) {
      Alert.alert(
        "Highlight Text",
        `Do you want to highlight: "${text}"?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Highlight",
            onPress: () => {
              const newHighlight = { cfiRange, text };
              setHighlights([...highlights, newHighlight]);

              // Add the highlight to the reader
              if (addAnnotation) {
                addAnnotation({
                  cfiRange,
                  data: { type: "highlight" },
                  styles: { backgroundColor: "yellow" },
                });
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
        onSelected={(selection) => handleTextSelected(selection)}
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
      <View style={styles.bottomMenu}>
        <TouchableOpacity onPress={handlePrevious} style={styles.iconButton}>
          <Icon name="arrow-back" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleHome} style={styles.iconButton}>
          <Icon name="home" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.iconButton}>
          <Icon name="arrow-forward" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  bottomMenu: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#1E1E1E",
    paddingVertical: 10,
  },
  iconButton: {
    padding: 10,
  },
});

export default ReaderScreen;
