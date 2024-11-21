import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useContext } from "react";
import { UserContext } from "../UserContext";

const Account = () => {
  const { user, logout, lastLogin } = useContext(UserContext);
  const username = user?.data?.user?.name || "User";
  const userEmail = user?.data?.user?.email || "No email provided";
  const userPhoto =
    user?.data?.user?.photo || "https://via.placeholder.com/150";
  const formattedLastLogin = lastLogin
    ? new Date(lastLogin).toLocaleString()
    : "No login data";

  return (
    <View style={styles.container}>
      <Image source={{ uri: userPhoto }} style={styles.profileImage} />
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.email}>{userEmail}</Text>
      <Text style={styles.lastLogin}>Last Login: {formattedLastLogin}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: "#BBBBBB",
    marginBottom: 10,
  },
  lastLogin: {
    fontSize: 14,
    color: "#BBBBBB",
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: "#FF6D6D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Account;
