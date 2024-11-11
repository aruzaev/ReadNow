import React, { useContext, useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Image } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { UserContext } from "../UserContext";

const Home = () => {
  const { user, lastLogin, logout } = useContext(UserContext);
  const [weeklyLists, setWeeklyLists] = useState([]);
  const [monthlyLists, setMonthlyLists] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const nytAPI = process.env.NYT_API_KEY;
  const openLibraryBaseUrl = process.env.OPEN_LIBRARY_API_BASE_URL;

  const getBestSellerLists = async () => {
    const url = `https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${nytAPI}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      const lists = data.results.map((list) => ({
        name: list.display_name,
        encodedName: list.list_name_encoded,
        updated: list.updated,
        oldestPublished: list.oldest_published_date,
        newestPublished: list.newest_published_date,
      }));

      const weekly = lists.filter((list) => list.updated === "WEEKLY");
      const monthly = lists.filter((list) => list.updated === "MONTHLY");

      setWeeklyLists(weekly.slice(0, 20));
      setMonthlyLists(monthly.slice(0, 20));
    } catch (error) {
      console.error("Error fetching best seller lists:", error);
    }
  };

  const fetchBooksForList = async (listNameEncoded) => {
    const url = `https://api.nytimes.com/svc/books/v3/lists/current/${listNameEncoded}.json?api-key=${nytAPI}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.results.books.map((book) => ({
        title: book.title,
        author: book.author,
        isbn: book.primary_isbn13,
      }));
    } catch (error) {
      console.error(`Error fetching books for ${listNameEncoded}:`, error);
      return [];
    }
  };

  const fetchCovers = async (books) => {
    return await Promise.all(
      books.map(async (book) => {
        const url = `${openLibraryBaseUrl}/search.json?title=${encodeURIComponent(
          book.title
        )}&author=${encodeURIComponent(book.author)}`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          const firstResult = data.docs[0];
          return {
            ...book,
            coverUrl: firstResult
              ? `https://covers.openlibrary.org/b/id/${firstResult.cover_i}-L.jpg`
              : "https://via.placeholder.com/150x200?text=No+Cover",
          };
        } catch (error) {
          console.error(`Error fetching cover for ${book.title}:`, error);
          return { ...book, coverUrl: null };
        }
      })
    );
  };

  const fetchPopularCategories = async () => {
    const popularCategories = ["hardcover-fiction", "hardcover-nonfiction"];
    try {
      const categories = await Promise.all(
        popularCategories.map(async (listNameEncoded) => {
          const books = await fetchBooksForList(listNameEncoded);
          return await fetchCovers(books);
        })
      );
      setPopularCategories(categories);
    } catch (error) {
      console.error("Error fetching popular categories:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getBestSellerLists();
      await fetchPopularCategories();
      setLoading(false);
    };

    fetchData();
  }, []);

  const renderCarousel = (books) => (
    <Carousel
      width={400}
      height={250}
      data={books}
      renderItem={({ item }) => (
        <View style={styles.carouselItem}>
          <Image source={{ uri: item.coverUrl }} style={styles.bookCover} />
          <Text style={styles.bookTitle}>{item.title}</Text>
        </View>
      )}
      loop={true}
    />
  );

  const userName = user?.data?.user?.name || "User";
  const formattedLastLogin = lastLogin
    ? new Date(lastLogin).toLocaleString()
    : "No login data";

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Welcome, {userName}</Text>
      <Text>Last Login: {formattedLastLogin}</Text>
      <Button title="Sign Out" onPress={logout} />

      <Text style={styles.sectionTitle}>Best Sellers (Weekly)</Text>
      {weeklyLists.map((list, index) => (
        <View key={index}>
          <Text style={styles.listTitle}>{list.name}</Text>
          {renderCarousel(list.books || [])}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Best Sellers (Monthly)</Text>
      {monthlyLists.map((list, index) => (
        <View key={index}>
          <Text style={styles.listTitle}>{list.name}</Text>
          {renderCarousel(list.books || [])}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Popular Categories</Text>
      {popularCategories.map((category, index) => (
        <View key={index}>
          <Text style={styles.listTitle}>Category {index + 1}</Text>
          {renderCarousel(category)}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
  },
  carouselItem: {
    alignItems: "center",
  },
  bookCover: {
    width: 150,
    height: 200,
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default Home;
