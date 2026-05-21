import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const FirebaseContext = createContext({});

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        // Check if user has completed the post-signup registration (Name and Location in Firestore)
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            setIsRegistered(true);
          } else {
            setIsRegistered(false);
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setIsRegistered(false);
        }
      } else {
        setUser(null);
        setIsRegistered(false);
      }
      setLoading(false); // Stop loading once auth state is resolved
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, isRegistered, setIsRegistered, loading, auth, db }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to consume the Firebase context globally
export const useFirebase = () => useContext(FirebaseContext);
