import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDhKiiv2GYaQzJLIakVWfmrnVMqaslrSnE",
  authDomain: "firestore-70552.firebaseapp.com",
  projectId: "firestore-70552",
  storageBucket: "firestore-70552.firebasestorage.app",
  messagingSenderId: "1025814488297",
  appId: "1:1025814488297:web:81382eec1e367642057c78",
  measurementId: "G-CPE3S7BDNE"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with proper persistence for Web and Native
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
