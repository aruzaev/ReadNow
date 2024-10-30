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
  const { user, setUser } = useContext(UserContext); // Use context to set the user

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "1082178052712-flcok3plqblmdcn4rehskfrqt9tmi7to.apps.googleusercontent.com",
    });
  }, []);

  const signin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      setUser(user); // Set user in context, which will trigger the navigation
      setError();
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
          onPress={signin}
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
