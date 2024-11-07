import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as firebase from "firebase";

const firebaseConfig = {};

const ReadingList = () => {
  return (
    <View style={styles.container}>
      <Text>My Reading List</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ReadingList;
