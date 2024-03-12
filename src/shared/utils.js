import { ToastAndroid } from "react-native";
import { db } from "../config/firebase";
import { collection } from "firebase/firestore";
import { useFonts } from "expo-font";
import moment from "moment";
import Toast from 'react-native-toast-message';

//Colors 
export const defaultTheme = "#D64045";

export const defaultPhoto = "https://i.pinimg.com/564x/05/11/45/051145a8e366876f859378154aa7df8b.jpg";

//Database Collection
export const accountsRef = collection(db, "accounts");
export const emergencyRequestRef = collection(db, "emergency-request");
export const messagesRef = collection(db, "messages");

export const loadFonts = () => {
    return useFonts({
        "NotoSans-Medium": require("../../assets/fonts/NotoSans-Medium.ttf"),
        "NotoSans-SemiBold": require("../../assets/fonts/NotoSans-SemiBold.ttf"),
        "NotoSans-Bold": require("../../assets/fonts/NotoSans-Bold.ttf"),
    });
};

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

export const toast = (message) => {
    ToastAndroid.showWithGravity(
        message,
        ToastAndroid.LONG,
        ToastAndroid.TOP
    );
}

export const showToast = (message1 = "", message2 = "", type = "success") => {
    Toast.show({
        type: type,
        text1: message1,
        text2: message2,
        text1Style: {
            fontSize: 15,
            color: type === "success" ? "green" : defaultTheme
        },
        text2Style: {
            fontSize: 11
        },
        visibilityTime: 2000,
        swipeable: true,
        position: "bottom"
    })
}

export const sendNotification = async (token, title, body) => {
    //notification message
    const message = {
        to: token,
        sound: "default",
        title: title,
        body: body
    }

    try {
        await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                host: "exp.host",
                accept: "application/json",
                "accept-encoding": "gzip, deflate",
                "content-type": "application/json"
            },
            body: JSON.stringify(message),
        });
    } catch (err) {
        console.error(err);
    }
}