import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBZtpfw6f_NR2jF5Kolpc-L66t1z6zL6EY",
  authDomain: "proxalert-78672.firebaseapp.com",
  projectId: "proxalert-78672",
  storageBucket: "proxalert-78672.appspot.com",
  messagingSenderId: "517909920098",
  appId: "1:517909920098:web:904847402153188762543b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);