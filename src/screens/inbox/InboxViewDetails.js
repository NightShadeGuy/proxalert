import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import moment from "moment";
import { useFonts } from "expo-font";

const InboxViewDetails = ({ route }) => {
    const {
        user,
        createdAt: { nanoseconds, seconds },
        address: { city, district, region, street, streetNumber }
    } = route.params;

    console.log(route);

    const calendarFormat = (nanoseconds, seconds) => {
        const milliseconds = seconds * 1000 + nanoseconds / 1e6;
        return moment(milliseconds).calendar();
    }

    const [fontsLoaded] = useFonts({
        "NotoSans-Medium": require("../../../assets/fonts/NotoSans-Medium.ttf"),
        "NotoSans-SemiBold": require("../../../assets/fonts/NotoSans-SemiBold.ttf"),
    })

    if (!fontsLoaded) {
        return undefined
    }


    return (
        <View style={{ flex: 1, backgroundColor: "#edf2f8" }}>
            <View style={styles.container}>
                <View style={styles.icon}>
                    <FontAwesome
                        name="envelope"
                        size={20}
                        color="white"
                    />
                </View>
                <Text style={[styles.text, { textAlign: "center" }]}>
                    {calendarFormat(nanoseconds, seconds)}
                </Text>
                <Text style={[styles.textTitle, { textAlign: "center" }]}>
                    You requested to saved your location
                </Text>
                <Text style={styles.textDetails}>Details</Text>
                <View style={{ paddingHorizontal: 10 }}>
                    <Text style={styles.text}>Name: {user}</Text>
                    <Text style={styles.text}>Region: {region}</Text>
                    <Text style={styles.text}>City: {city}</Text>
                    <Text style={styles.text}>District: {district}</Text>
                    <Text style={styles.text}>Street Number: {streetNumber}</Text>
                    <Text style={styles.text}>Street: {street}</Text>
                </View>

            </View>
        </View>
    )
}

export default InboxViewDetails;

const styles = StyleSheet.create({
    container: {
        shadowColor: "#000",
        shadowOpacity: 0.3,
        elevation: 3,
        marginVertical: 50,
        marginHorizontal: 20,
        backgroundColor: "white",
        padding: 20,
        borderRadius: 6,
        position: "relative"
    },
    icon: {
        position: "absolute",
        top: -20,
        left: "50%",
        backgroundColor: "#D64045",
        padding: 8,
        borderRadius: 20
    },
    textTitle: {
        fontSize: 20,
        color: "#D64045",
        fontFamily: "NotoSans-SemiBold",
        paddingBottom: 25,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e4e9"
    },
    textDetails: {
        color: "gray",
        fontSize: 15,
        fontFamily: "NotoSans-SemiBold",
    },
    text: {
        color: "gray",
        fontSize: 12,
        fontFamily: "NotoSans-Medium"
    }

})