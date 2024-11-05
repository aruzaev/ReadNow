import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { UserContext } from "../UserContext";

const Home = () => {
  const { user, lastLogin, logout } = useContext(UserContext);

  const userName = user?.data?.user?.name || "User";
  const formattedLastLogin = lastLogin
    ? new Date(lastLogin).toLocaleString()
    : "No login data";

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Welcome, {userName}</Text>
      <Text>
        Last Login:
        {formattedLastLogin}
      </Text>
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
