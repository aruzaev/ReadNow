// UserContext.js
import React, { createContext, useState, useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkIfSignedIn = async () => {
      try {
        // Use getCurrentUser to check if user is already signed in
        const userInfo = GoogleSignin.getCurrentUser();
        if (userInfo) {
          setUser(userInfo);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking sign-in status:", error);
      }
    };
    checkIfSignedIn();
  }, []);

  const logout = async () => {
    setUser(null); // Clear user from context on logout
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
