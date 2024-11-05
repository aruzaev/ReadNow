import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext"; // Import UserContext

export default function Signin({ navigation }) {
  const [error, setError] = useState();
  const { user, login } = useContext(UserContext); // Use context to set the user

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
      <Text>Hello World</Text>
      <Text>{JSON.stringify(error)}</Text>
      {user && <Text>{JSON.stringify(user)}</Text>}
      {user ? (
        <Button title="Logout" onPress={logout} />
      ) : (
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleSignIn}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
});
