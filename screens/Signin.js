import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";

export default function Signin({ navigation }) {
  const [error, setError] = useState();
  const { user, login } = useContext(UserContext);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "1082178052712-flcok3plqblmdcn4rehskfrqt9tmi7to.apps.googleusercontent.com",
    });
  }, []);

  const handleSignIn = async () => {
    try {
      await login();
      setError(null);
    } catch (error) {
      setError(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>pock</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>
      {error && <Text style={styles.error}>{error.message}</Text>}
      {user ? (
        <>
          <Text style={styles.userInfo}>
            Logged in as: {JSON.stringify(user)}
          </Text>
          <Button title="Logout" onPress={logout} color="#FF6D6D" />
        </>
      ) : (
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleSignIn}
          style={styles.googleButton}
        />
      )}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#B3B3B3",
    marginBottom: 30,
  },
  error: {
    fontSize: 14,
    color: "#FF6D6D",
    marginBottom: 20,
    textAlign: "center",
  },
  userInfo: {
    fontSize: 16,
    color: "#B3B3B3",
    marginBottom: 20,
    textAlign: "center",
  },
  googleButton: {
    width: 192,
    height: 48,
  },
});
