import { ToastAndroid } from "react-native";
import { db } from "../config/firebase";
import { collection } from "firebase/firestore";
import { useFonts } from "expo-font";


//Colors 
export const defaultTheme = "#D64045";

//Database Collection
export const clientAccountRef = collection(db, "client-account");
export const responderAccountRef = collection(db, "responder-account");
export const clientLocationRef = collection(db, "client-location");
export const responderLocationRef = collection(db, "client-location");

export const loadFonts = () => {
    return useFonts({
        "NotoSans-Medium": require("../../assets/fonts/NotoSans-Medium.ttf"),
        "NotoSans-SemiBold": require("../../assets/fonts/NotoSans-SemiBold.ttf"),
        "NotoSans-Bold": require("../../assets/fonts/NotoSans-Bold.ttf"),
    });
};

export const toast = (message) => {
    ToastAndroid.showWithGravity(
        message,
        ToastAndroid.LONG,
        ToastAndroid.TOP
/*         0,
        50, */
    );
}