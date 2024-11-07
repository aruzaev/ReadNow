import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useContext } from "react";
import { UserContext } from "../UserContext";

const Account = () => {
  const { user } = useContext(UserContext);
  const username = user?.data?.user?.name;
  const userPhoto = user?.data?.user?.photo;

  return (
    <View style={styles.container}>
      <Text>My Account</Text>
      <Text>{username}</Text>
      <Image source={{ uri: userPhoto }} style={styles.profileImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
});

export default Account;
