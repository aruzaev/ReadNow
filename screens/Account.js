import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { UserContext } from "../UserContext";
import Icon from "react-native-vector-icons/Ionicons";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, getDocs, onSnapshot } from "firebase/firestore";

const Account = () => {
  const { user, lastLogin, logout } = useContext(UserContext);
  const [totalBooks, setTotalBooks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser?.uid) {
      setTotalBooks(0);
      setIsLoading(false);
      return;
    }

    const uploadsRef = collection(db, "users", currentUser.uid, "uploads");
    const unsubscribe = onSnapshot(
      uploadsRef,
      (snapshot) => {
        console.log("Books update detected, new count:", snapshot.size);
        setTotalBooks(snapshot.size);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to uploads:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {auth.currentUser?.photoURL ? (
            <Image
              source={{ uri: auth.currentUser.photoURL }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {auth.currentUser?.email?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.displayName}>
          {auth.currentUser?.displayName ||
            auth.currentUser?.email?.split("@")[0] ||
            "User"}
        </Text>
        <Text style={styles.email}>
          {auth.currentUser?.email || "No email provided"}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="book-outline" size={24} color="#007AFF" />
          <Text style={styles.statNumber}>
            {isLoading ? "..." : totalBooks}
          </Text>
          <Text style={styles.statLabel}>Total Books</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="time-outline" size={24} color="#007AFF" />
          <Text style={styles.statLabel}>Last Login</Text>
          <Text style={styles.statValue}>
            {lastLogin ? new Date(lastLogin).toLocaleDateString() : "N/A"}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Icon name="log-out-outline" size={24} color="#FF6B6B" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 40,
    color: "#FFFFFF",
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#BBBBBB",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#BBBBBB",
  },
  statValue: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    color: "#FF6B6B",
    marginLeft: 10,
    fontWeight: "bold",
  },
});

export default Account;
