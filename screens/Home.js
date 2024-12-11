import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { UserContext } from "../UserContext";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import Upload from "./Upload";

const RECENT_BOOKS_LIMIT = 5;
const WEEKLY_BOOKS_LIMIT = 5;

const Home = ({ navigation }) => {
  const { user, lastLogin, logout } = useContext(UserContext);
  const [recentBooks, setRecentBooks] = useState([]);
  const [weeklyBooks, setWeeklyBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentUser = auth.currentUser;
      console.log("Current user:", currentUser?.uid);

      if (!currentUser) {
        console.error("No user is logged in");
        setError("No user logged in");
        return;
      }

      const userID = currentUser.uid;
      console.log("Fetching books for user:", userID);

      const bookCollection = collection(db, `users/${userID}/uploads`);
      console.log("Collection path:", `users/${userID}/uploads`);

      const recentQuery = query(
        bookCollection,
        orderBy("uploadedAt", "desc"),
        limit(RECENT_BOOKS_LIMIT)
      );

      console.log("Executing query...");
      const recentSnapshot = await getDocs(recentQuery);
      console.log("Query complete. Documents found:", recentSnapshot.size);

      const recentData = recentSnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Book data:", data);
        return {
          id: doc.id,
          ...data,
        };
      });

      console.log("Processed recent books:", recentData);
      setRecentBooks(recentData);
      setWeeklyBooks(recentData);
    } catch (error) {
      console.error("Error fetching books:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Component mounted");
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed. Current user:", user?.uid);
      if (user) {
        fetchBooks();
      }
    });

    if (auth.currentUser) {
      console.log("User already logged in, fetching books");
      fetchBooks();
    }

    return () => {
      console.log("Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("Screen focused, refreshing books");
      fetchBooks();
    });

    return unsubscribe;
  }, [navigation]);

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => {
        console.log("Navigating to reader with book:", item);
        navigation.navigate("Reader", { book: item });
      }}
    >
      {item.coverUrl ? (
        <Image
          source={{ uri: item.coverUrl }}
          style={styles.bookCover}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.bookCover, styles.bookCoverFallback]}>
          <Text style={styles.bookCoverText}>
            {item.metadata?.title?.[0] || item.name?.[0] || "📚"}
          </Text>
        </View>
      )}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.metadata?.title || item.name || "Untitled"}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.metadata?.creator || "Unknown Author"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6D6D" />
        <Text style={styles.loadingText}>Loading your books...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>
            Welcome, {auth.currentUser?.displayName || "User"}
          </Text>
          <Text style={styles.lastLogin}>
            Last Login:{" "}
            {lastLogin ? new Date(lastLogin).toLocaleString() : "N/A"}
          </Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={styles.errorText}>Error loading books: {error}</Text>
      )}

      <View style={styles.uploadSection}>
        <Upload onUploadSuccess={fetchBooks} />
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recently Added Books</Text>
        {recentBooks.length > 0 ? (
          <FlatList
            data={recentBooks}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bookList}
          />
        ) : (
          <Text style={styles.noBooksText}>No books added yet</Text>
        )}
      </View>

      <View style={styles.weeklySection}>
        <Text style={styles.sectionTitle}>My Library Highlights</Text>
        {weeklyBooks.length > 0 ? (
          <Carousel
            width={400}
            height={250}
            data={weeklyBooks}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.carouselItem}
                onPress={() => navigation.navigate("Reader", { book: item })}
              >
                {item.coverUrl ? (
                  <Image
                    source={{ uri: item.coverUrl }}
                    style={styles.carouselCover}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[styles.carouselCover, styles.bookCoverFallback]}
                  >
                    <Text style={styles.carouselCoverText}>
                      {item.metadata?.title?.[0] || item.name?.[0] || "📚"}
                    </Text>
                  </View>
                )}
                <View style={styles.carouselInfo}>
                  <Text style={styles.carouselTitle} numberOfLines={2}>
                    {item.metadata?.title || item.name || "Untitled"}
                  </Text>
                  <Text style={styles.carouselAuthor} numberOfLines={1}>
                    {item.metadata?.creator || "Unknown Author"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            loop={weeklyBooks.length > 1}
          />
        ) : (
          <Text style={styles.noBooksText}>No books available</Text>
        )}
      </View>

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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  lastLogin: {
    fontSize: 14,
    color: "#BBBBBB",
  },
  logoutButton: {
    padding: 10,
  },
  logoutText: {
    fontSize: 16,
    color: "#FF6D6D",
    textDecorationLine: "underline",
  },
  uploadSection: {
    marginBottom: 20,
  },
  recentSection: {
    marginBottom: 20,
  },
  weeklySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  errorText: {
    color: "#FF6D6D",
    textAlign: "center",
    marginVertical: 10,
  },
  loadingText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 10,
  },
  bookList: {
    paddingHorizontal: 5,
  },
  bookItem: {
    width: 150,
    marginRight: 20,
  },
  bookCover: {
    width: 150,
    height: 200,
    borderRadius: 8,
    backgroundColor: "#1E1E1E",
  },
  bookCoverFallback: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
  },
  bookCoverText: {
    fontSize: 40,
    color: "#FFFFFF",
  },
  bookInfo: {
    marginTop: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#BBBBBB",
  },
  carouselItem: {
    alignItems: "center",
    padding: 10,
  },
  carouselCover: {
    width: 200,
    height: 280,
    borderRadius: 12,
    marginBottom: 10,
  },
  carouselCoverText: {
    fontSize: 48,
    color: "#FFFFFF",
  },
  carouselInfo: {
    width: "100%",
    alignItems: "center",
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 4,
  },
  carouselAuthor: {
    fontSize: 16,
    color: "#BBBBBB",
    textAlign: "center",
  },
  noBooksText: {
    color: "#BBBBBB",
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 20,
  },
  readingListLink: {
    marginTop: "auto",
    paddingVertical: 12,
    paddingHorizontal: 24,
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
