import React, { createContext, useState, useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { auth } from "./firebase/firebaseConfig";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkIfSignedIn = async () => {
      try {
        const userInfo = auth.currentUser;
        if (userInfo) {
          setUser(userInfo);
          setLastLogin(Date.now());
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking sign-in status:", error);
      } finally {
        setLoading(false);
      }
    };
    checkIfSignedIn();
  }, []);

  const login = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      console.log("User Info:", user);
      console.log("Profile picture url: ", user.data.user.photo);

      const { idToken } = user.data;
      console.log(idToken);

      const credential = GoogleAuthProvider.credential(idToken);
      const firebaseUser = await signInWithCredential(auth, credential);

      console.log("Firebase User:", firebaseUser);

      setUser(firebaseUser);
      setLastLogin(Date.now());
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();

      setUser(null);
      setLastLogin(null);
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, login, logout, lastLogin, loading }}
    >
      {children}
    </UserContext.Provider>
  );
};
