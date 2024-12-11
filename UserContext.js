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
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = userInfo;

      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);

      // Check if this is a new user
      if (result._tokenResponse?.isNewUser) {
        await initializeUserData(result.user.uid);
      }

      setUser(result.user);
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
