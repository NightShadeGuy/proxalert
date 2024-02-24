import { ToastAndroid } from "react-native";
import { db } from "../config/firebase";
import { collection } from "firebase/firestore";
import { useFonts } from "expo-font";
import moment from "moment";


//Colors 
export const defaultTheme = "#D64045";

//Database Collection
export const accountsRef = collection(db, "accounts");
export const emergencyRequestRef = collection(db, "emergency-request");

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
    );
}

export const emergencyTypes = [
    {
        type: "Medical",
        color: "#4caf50",
        iconName: "briefcase-medical"
    }, {
        type: "Fire",
        color: "#e57373",
        iconName: "fire"
    }, {
        type: "Accident",
        color: "#9575cd",
        iconName: "car-crash"
    }, {
        type: "Violence",
        color: "#e91e63",
        iconName: "hand-holding-water"
    }, {
        type: "Rescue",
        color: "#ffeb3b",
        iconName: "hand-holding-medical"
    }
];


export const calendarFormat = (nanoseconds, seconds) => {     //Ex. Today at 10:59 AM
    const milliseconds = seconds * 1000 + nanoseconds / 1e6;
    return moment(milliseconds).calendar();
}
