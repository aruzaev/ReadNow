// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJZqIX3H6GsWn-Yp9FH_7p673Sh3Ch9LU",
  authDomain: "pock-122a9.firebaseapp.com",
  projectId: "pock-122a9",
  storageBucket: "pock-122a9.appspot.com",
  messagingSenderId: "1082178052712",
  appId: "1:1082178052712:web:02100e9ae885aed71851dd",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
