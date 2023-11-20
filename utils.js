import { ToastAndroid } from "react-native";

export const toast = (message) => {
    ToastAndroid.showWithGravityAndOffset(
        message,
        ToastAndroid.LONG,
        ToastAndroid.TOP,
        0,
        50,
    );
}