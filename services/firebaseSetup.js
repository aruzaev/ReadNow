import { db } from "../firebase/firebaseConfig";
import { doc, setDoc, collection } from "firebase/firestore";

export const initializeUserData = async (userId) => {
  try {
    // Create the base user document
    const userRef = doc(db, "users", userId);

    //  progress collection
    await setDoc(doc(collection(db, `users/${userId}/progress`), "init"), {
      initialized: true,
      createdAt: new Date(),
    });

    //  reading stats
    await setDoc(doc(db, `users/${userId}/stats`), {
      totalBooksRead: 0,
      totalReadingTime: 0,
      readingStreak: 0,
      lastReadDate: new Date(),
    });

    //  reading goals
    await setDoc(doc(db, `users/${userId}/goals`), {
      daily: 30,
      weekly: 210,
      pagesPerDay: 20,
      booksPerMonth: 2,
      startDate: new Date(),
      lastUpdated: new Date(),
    });

    console.log("User data structure initialized successfully");
  } catch (error) {
    console.error("Error initializing user data structure:", error);
  }
};
