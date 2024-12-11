import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import Epub from "epubjs";

const Reader = ({ route }) => {
  const { book } = route.params;
  const webviewRef = useRef(null);

  useEffect(() => {
    const fetchBookContent = async () => {
      const epub = Epub(book.uri);
      const rendition = epub.renderTo("viewer", {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
      });
      rendition.display();
    };

    fetchBookContent();
  }, [book]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ uri: book.uri }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  webview: {
    flex: 1,
  },
});

export default Reader;
