import { ToastAndroid } from "react-native";
import { db } from "./src/config/firebase";
import { collection } from "firebase/firestore";
import { useFonts } from "expo-font";

export const locationRef = collection(db, "user-location");

export const loadFonts = () => {
    return useFonts({
        "NotoSans-Medium": require("./assets/fonts/NotoSans-Medium.ttf"),
        "NotoSans-SemiBold": require("./assets/fonts/NotoSans-SemiBold.ttf"),
        "NotoSans-Bold": require("./assets/fonts/NotoSans-Bold.ttf"),
    });
};

export const toast = (message) => {
    ToastAndroid.showWithGravityAndOffset(
        message,
        ToastAndroid.LONG,
        ToastAndroid.TOP,
        0,
        50,
    );
}