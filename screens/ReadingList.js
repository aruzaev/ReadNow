import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { db, auth } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";

const PAGE_SIZE = 10;

const ReadingList = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("No user is logged in");
        setLoading(false);
        return;
      }

      const userID = currentUser.uid;
      const bookCollection = collection(db, `users/${userID}/uploads`);
      let bookQuery = query(
        bookCollection,
        orderBy("uploadedAt", "desc"),
        limit(PAGE_SIZE)
      );

      if (lastVisible) {
        bookQuery = query(
          bookCollection,
          orderBy("uploadedAt", "desc"),
          startAfter(lastVisible),
          limit(PAGE_SIZE)
        );
      }

      const querySnapshot = await getDocs(bookQuery);

      const newBooks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Fetched books:", newBooks);

      setBooks((prevBooks) => [...prevBooks, ...newBooks]);

      if (querySnapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const loadMoreBooks = () => {
    if (hasMore && !loading) {
      fetchBooks();
    }
  };

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => {
        console.log("Navigating with book:", item);
        navigation.navigate("Reader", { book: item });
      }}
    >
      <Image
        source={{
          uri:
            item.coverUrl ||
            "https://via.placeholder.com/150x200?text=No+Cover",
        }}
        style={styles.bookCover}
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>
          {item.metadata?.title || item.name || "Untitled"}
        </Text>
        <Text style={styles.bookAuthor}>
          {item.metadata?.author || "Unknown Author"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Reading List</Text>
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreBooks}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#FF6D6D" /> : null
        }
      />
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  bookItem: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 10,
    borderRadius: 8,
  },
  bookCover: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 10,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  bookAuthor: {
    fontSize: 14,
    color: "#BBBBBB",
  },
});

export default ReadingList;
