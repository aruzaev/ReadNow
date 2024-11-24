import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { storage } from "../firebase/firebaseConfig";
import { ref } from "firebase/storage";
import { UserContext } from "../UserContext";

const Upload = () => {};

export default Upload;
