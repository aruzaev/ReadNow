import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Button,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { db, auth, storage } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import Upload from "./Upload";

const PAGE_SIZE = 10;

const ReadingList = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchBooks = async (forceRefresh = false) => {
    if (!forceRefresh && (loading || !hasMore)) return;

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

      let bookQuery;
      if (forceRefresh || !lastVisible) {
        bookQuery = query(
          bookCollection,
          orderBy("uploadedAt", "desc"),
          limit(PAGE_SIZE)
        );
      } else {
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

      if (forceRefresh) {
        setBooks(newBooks);
      } else {
        setBooks((prevBooks) => [...prevBooks, ...newBooks]);
      }

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
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("Screen focused, refreshing books...");
      refreshBooks();
    });

    return unsubscribe;
  }, [navigation]);

  const refreshBooks = async () => {
    console.log("Refreshing books...");
    setBooks([]);
    setLastVisible(null);
    setHasMore(true);
    await fetchBooks(true);
  };

  const loadMoreBooks = () => {
    console.log("Loading more books...");
    if (hasMore && !loading) {
      fetchBooks(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBook) return;
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert("Error", "No user is logged in");
        return;
      }

      const userID = currentUser.uid;

      const bookDocRef = doc(db, `users/${userID}/uploads/${selectedBook.id}`);
      await deleteDoc(bookDocRef);

      try {
        const storageRef = ref(storage, selectedBook.path);
        await deleteObject(storageRef);
      } catch (error) {
        console.log("Storage file may not exist:", error);
      }

      setBooks((prevBooks) =>
        prevBooks.filter((book) => book.id !== selectedBook.id)
      );

      Alert.alert("Success", "Book deleted successfully");
      setShowModal(false);
      setSelectedBook(null);
    } catch (error) {
      console.error("Error deleting book:", error);
      Alert.alert("Error", "Failed to delete the book");
    }
  };

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => {
        navigation.navigate("Reader", { book: item });
      }}
    >
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>
          {item.metadata?.title || item.name || "Untitled"}
        </Text>
        <Text style={styles.bookAuthor}>
          {item.metadata?.creator || "Unknown Author"}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          setSelectedBook(item);
          setShowModal(true);
        }}
      >
        <Icon name="trash-outline" size={20} color="#FFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Reading List</Text>
      <Upload onUploadSuccess={refreshBooks} />
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
      {showModal && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Are you sure you want to delete this book?
              </Text>
              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => setShowModal(false)} />
                <Button title="Delete" onPress={handleDelete} color="red" />
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    justifyContent: "space-between",
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
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "red",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default ReadingList;
