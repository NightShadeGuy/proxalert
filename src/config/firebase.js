import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import {
  EXPO_API_KEY,
  EXPO_AUTH_DOMAIN,
  EXPO_PROJECT_ID,
  EXPO_STORAGE_BUCKET,
  EXPO_MESSAGING_SENDER_ID,
  EXPO_APP_ID
} from "@env"

const firebaseConfig = {
  apiKey: EXPO_API_KEY,
  authDomain: EXPO_AUTH_DOMAIN,
  projectId: EXPO_PROJECT_ID,
  storageBucket: EXPO_STORAGE_BUCKET,
  messagingSenderId: EXPO_MESSAGING_SENDER_ID,
  appId: EXPO_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
})
export const db = getFirestore(app);
export const storage = getStorage(app);