import React, { useContext, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { UserContext } from "../UserContext";
// import Carousel from "react-native-snap-carousel";

const Home = () => {
  const { user, lastLogin, logout } = useContext(UserContext);
  const [weeklyLists, setWeeklyLists] = useState([]);
  const [monthlyLists, setMonthlyLists] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const getBestSellerLists = async () => {
    const nytAPI = process.env.NYT_API_KEY;
    const url = `https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${nytAPI}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const lists = data.results.map((list) => ({
        name: list.display_name,
        encodedName: list.list_name_encoded,
        oldestPublished: list.oldest_published_date,
        newestPublished: list.newest_published_date,
      }));

      const weeklyLists = lists.filter((list) => list.updated === "WEEKLY");
      const monthlyLists = lists.filter((list) => list.updated === "MONTHLY");

      // top 20
      setWeeklyLists(weeklyLists.slice(0, 20));
      setMonthlyLists(monthlyLists.slice(0, 20));

      console.log(lists);
      return lists;
    } catch (error) {
      console.error("Error fetching best seller list:", error);
      return [];
    }
  };

  const userName = user?.data?.user?.name || "User";
  const formattedLastLogin = lastLogin
    ? new Date(lastLogin).toLocaleString()
    : "No login data";

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Welcome, {userName}</Text>
      <Text>
        Last Login:
        {formattedLastLogin}
      </Text>
      <Button title="Fetch Best Sellets" onPress={getBestSellerLists} />
      <Button title="Sign Out" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Home;
