import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { UserContext } from "../UserContext";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import Modal from "react-native-modal";
import Upload from "./Upload";
import Icon from "react-native-vector-icons/Ionicons";

const RECENT_BOOKS_LIMIT = 5;
const NYT_BOOKS_URL = `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${process.env.NYT_API_KEY}`;

const Home = ({ navigation }) => {
  const { user, lastLogin, logout } = useContext(UserContext);
  const [recentBooks, setRecentBooks] = useState([]);
  const [nytBooks, setNytBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);

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
    } catch (error) {
      console.error("Error fetching books:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNYTBooks = async () => {
    try {
      const response = await fetch(NYT_BOOKS_URL);
      const data = await response.json();
      if (data.results && data.results.books) {
        setNytBooks(data.results.books);
      }
    } catch (error) {
      console.error("Error fetching NYT books:", error);
    }
  };

  useEffect(() => {
    console.log("Component mounted");
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed. Current user:", user?.uid);
      if (user) {
        fetchBooks();
        fetchNYTBooks();
      }
    });

    if (auth.currentUser) {
      console.log("User already logged in, fetching books");
      fetchBooks();
      fetchNYTBooks();
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

  const BookDetailsModal = () => (
    <Modal
      isVisible={showBookModal}
      onBackdropPress={() => setShowBookModal(false)}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={styles.modal}
    >
      {selectedBook && (
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedBook.title}</Text>
            <TouchableOpacity onPress={() => setShowBookModal(false)}>
              <Icon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Image
              source={{ uri: selectedBook.book_image }}
              style={styles.modalBookCover}
              resizeMode="contain"
            />

            <Text style={styles.modalAuthor}>By {selectedBook.author}</Text>

            <View style={styles.modalStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Rank</Text>
                <Text style={styles.statValue}>#{selectedBook.rank}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Weeks on List</Text>
                <Text style={styles.statValue}>
                  {selectedBook.weeks_on_list}
                </Text>
              </View>
            </View>

            <Text style={styles.modalDescription}>
              {selectedBook.description}
            </Text>

            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => Linking.openURL(selectedBook.amazon_product_url)}
            >
              <Text style={styles.buyButtonText}>Buy on Amazon</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </Modal>
  );

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
        <Text style={styles.sectionTitle}>NYT Bestsellers</Text>
        {nytBooks.length > 0 ? (
          <Carousel
            width={400}
            height={400}
            data={nytBooks}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.carouselItem}
                onPress={() => {
                  setSelectedBook(item);
                  setShowBookModal(true);
                }}
              >
                <Image
                  source={{ uri: item.book_image }}
                  style={styles.carouselCover}
                  resizeMode="cover"
                />
                <View style={styles.carouselInfo}>
                  <Text style={styles.carouselTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.carouselAuthor} numberOfLines={1}>
                    {item.author}
                  </Text>
                  <Text style={styles.carouselRank}>
                    #{item.rank} on NYT Bestsellers
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            loop={true}
          />
        ) : (
          <Text style={styles.noBooksText}>Loading bestsellers...</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.readingListLink}
        onPress={() => navigation.navigate("Reading List")}
      >
        <Text style={styles.readingListText}>Go to My Reading List</Text>
      </TouchableOpacity>

      <BookDetailsModal />
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
  carouselRank: {
    color: "#007AFF",
    fontSize: 14,
    marginTop: 4,
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
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  modalBookCover: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalAuthor: {
    color: "#BBBBBB",
    fontSize: 18,
    marginBottom: 20,
  },
  modalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    color: "#BBBBBB",
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalDescription: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  buyButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Home;
