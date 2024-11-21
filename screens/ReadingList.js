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

const PAGE_SIZE = 10;

const ReadingList = () => {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = async (page) => {
    setLoading(true);
    try {
      const newBooks = Array.from({ length: PAGE_SIZE }, (_, index) => ({
        id: `book-${page * PAGE_SIZE + index}`,
        title: `Book Title ${page * PAGE_SIZE + index}`,
        author: `Author ${page * PAGE_SIZE + index}`,
        coverUrl: "https://via.placeholder.com/150x200?text=Book+Cover",
      }));
      setBooks((prevBooks) => [...prevBooks, ...newBooks]);
      if (newBooks.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks(currentPage);
  }, [currentPage]);

  const loadMoreBooks = () => {
    if (hasMore && !loading) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const renderBookItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={{ uri: item.coverUrl }} style={styles.bookCover} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>{item.author}</Text>
      </View>
    </View>
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
