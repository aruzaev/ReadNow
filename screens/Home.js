import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { UserContext } from "../UserContext";

const Home = () => {
  const { logout } = useContext(UserContext);

  return (
    <View style={styles.container}>
      <Text>Welcome to the Home Page!</Text>
      <Button title="Sign Out" onPress={logout} />
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

export default Home;
