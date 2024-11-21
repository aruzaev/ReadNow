import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { UserContext } from "../UserContext";

const Home = ({ navigation }) => {
  const { user, lastLogin, logout } = useContext(UserContext);
  const [recentBooks, setRecentBooks] = useState([]);
  const [weeklyBooks, setWeeklyBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecentBooks = async () => {
      const books = [
        {
          title: "Book 1",
          author: "Author 1",
          coverUrl: "https://via.placeholder.com/150x200",
        },
        {
          title: "Book 2",
          author: "Author 2",
          coverUrl: "https://via.placeholder.com/150x200",
        },
        {
          title: "Book 3",
          author: "Author 3",
          coverUrl: "https://via.placeholder.com/150x200",
        },
        {
          title: "Book 4",
          author: "Author 4",
          coverUrl: "https://via.placeholder.com/150x200",
        },
        {
          title: "Book 5",
          author: "Author 5",
          coverUrl: "https://via.placeholder.com/150x200",
        },
      ];
      setRecentBooks(books);
    };

    const fetchWeeklyBooks = async () => {
      const books = [
        {
          title: "Weekly Book 1",
          coverUrl: "https://via.placeholder.com/150x200",
        },
        {
          title: "Weekly Book 2",
          coverUrl: "https://via.placeholder.com/150x200",
        },
        {
          title: "Weekly Book 3",
          coverUrl: "https://via.placeholder.com/150x200",
        },
        {
          title: "Weekly Book 4",
          coverUrl: "https://via.placeholder.com/150x200",
        },
        {
          title: "Weekly Book 5",
          coverUrl: "https://via.placeholder.com/150x200",
        },
      ];
      setWeeklyBooks(books);
    };

    const fetchData = async () => {
      setLoading(true);
      await fetchRecentBooks();
      await fetchWeeklyBooks();
      setLoading(false);
    };

    fetchData();
  }, []);

  const renderRecentBooks = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={{ uri: item.coverUrl }} style={styles.bookCover} />
      <Text style={styles.bookTitle}>{item.title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Welcome, {user?.data?.user?.name || "User"}
      </Text>
      <Text style={styles.lastLogin}>
        Last Login: {lastLogin ? new Date(lastLogin).toLocaleString() : "N/A"}
      </Text>
      <Text style={styles.logout} onPress={logout}>
        Sign Out
      </Text>

      <Text style={styles.sectionTitle}>Recently Opened Books</Text>
      <FlatList
        data={recentBooks}
        renderItem={renderRecentBooks}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      <Text style={styles.sectionTitle}>Weekly Top Books</Text>
      <Carousel
        width={400}
        height={250}
        data={weeklyBooks}
        renderItem={({ item }) => (
          <View style={styles.carouselItem}>
            <Image source={{ uri: item.coverUrl }} style={styles.bookCover} />
            <Text style={styles.bookTitle}>{item.title}</Text>
          </View>
        )}
        loop={true}
      />

      <TouchableOpacity
        style={styles.readingListLink}
        onPress={() => navigation.navigate("Reading List")}
      >
        <Text style={styles.readingListText}>Go to My Reading List</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  lastLogin: {
    fontSize: 14,
    color: "#BBBBBB",
    marginBottom: 20,
  },
  logout: {
    fontSize: 16,
    color: "#FF6D6D",
    marginBottom: 20,
    textDecorationLine: "underline",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginVertical: 20,
  },
  bookItem: {
    alignItems: "center",
    marginRight: 15,
  },
  bookCover: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
  },
  carouselItem: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
  },
  readingListLink: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#1E90FF",
    borderRadius: 8,
    alignSelf: "center",
  },
  readingListText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default Home;
