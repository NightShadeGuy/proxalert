import { ToastAndroid } from "react-native";
import { db } from "../config/firebase";
import { collection } from "firebase/firestore";
import { useFonts } from "expo-font";
import moment from "moment";
import Toast from 'react-native-toast-message';

//Color
export const defaultTheme = "#D64045";

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


export const defaultPhoto = "https://i.pinimg.com/564x/05/11/45/051145a8e366876f859378154aa7df8b.jpg";
export const useDefaultPhoto = (responder, type = "") => {
    let photo = "";
    let vehicleIcon = "";
    if (responder) {
        switch (type) {
            case "Medical":
                photo = "https://firebasestorage.googleapis.com/v0/b/proxalert-78672.appspot.com/o/images%2FdefaultProfile%2Fnurse.png?alt=media&token=4d869fca-edef-41da-ac1e-c1263873a979";
                vehicleIcon = "https://firebasestorage.googleapis.com/v0/b/proxalert-78672.appspot.com/o/images%2Ficons%2Fambulance.png?alt=media&token=461a0c59-67fc-429b-a10c-8437fbf292ab";
                break;
            case "Police":
                photo = "https://firebasestorage.googleapis.com/v0/b/proxalert-78672.appspot.com/o/images%2FdefaultProfile%2Fpoliceman.png?alt=media&token=e87335c6-6d38-4ceb-b772-821027633746";
                vehicleIcon = "https://firebasestorage.googleapis.com/v0/b/proxalert-78672.appspot.com/o/images%2Ficons%2Fpolice-car.png?alt=media&token=bc83425a-8733-4e93-9c06-62a6b406b053";
                break;
            case "Fire fighter":
                photo = "https://firebasestorage.googleapis.com/v0/b/proxalert-78672.appspot.com/o/images%2FdefaultProfile%2Ffirefighter.png?alt=media&token=f232b8de-db8c-46a3-b69a-1b9709ec1158";
                vehicleIcon = "https://firebasestorage.googleapis.com/v0/b/proxalert-78672.appspot.com/o/images%2Ficons%2Ffire-truck.png?alt=media&token=84df57b1-f30c-46a5-a4bc-b9cb505b9baf";
                break;
        }
    } else {
        photo = "https://firebasestorage.googleapis.com/v0/b/proxalert-78672.appspot.com/o/images%2FdefaultProfile%2Fdefault.jpg?alt=media&token=b75335dd-f619-44c4-832c-8aadf5e0cdbf";
    }
    return { photo, vehicleIcon };
}