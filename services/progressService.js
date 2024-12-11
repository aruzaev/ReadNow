import { db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export const saveBookProgress = async (userId, bookId, progressData) => {
  try {
    const progressRef = doc(db, `users/${userId}/progress/${bookId}`);
    await setDoc(
      progressRef,
      {
        bookId,
        ...progressData,
        lastUpdated: new Date(),
      },
      { merge: true }
    );

    console.log("Progress saved successfully");
  } catch (error) {
    console.error("Error saving progress:", error);
    throw error;
  }
};
