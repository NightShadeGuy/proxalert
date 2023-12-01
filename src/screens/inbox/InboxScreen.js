import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from "react-native";
import React, { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { FontAwesome } from '@expo/vector-icons';
import moment from "moment";
import LoadingModal from "../../components/LoadingModal";
import { useNavigation } from "@react-navigation/native";

const InboxScreen = () => {
    const navigation = useNavigation();
    const [listData, setListData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    //This will fetch list of saved user location
    const loadAllRequestSaved = async () => {
        const locationRef = collection(db, "user-location");
        setIsLoading(true);
        try {
            const data = await getDocs(locationRef);
            const savedData = data.docs.map(doc => doc.data())
            setListData(savedData);
            console.log(listData);
        } catch (err) {
            console.error(err.message)
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadAllRequestSaved();
    }, [])

    const requestedOn = (nanoseconds, seconds) => {
        const milliseconds = seconds * 1000 + nanoseconds / 1e6 // Convert nanoseconds to milliseconds

        if (milliseconds >= 86400000) { //reach 1 day or more
            return moment(milliseconds).format("MMM Do YYYY");
        }
        return moment(milliseconds).startOf("hour").fromNow();
    }

    const [fontsLoaded] = useFonts({
        "NotoSans-Medium": require("../../../assets/fonts/NotoSans-Medium.ttf"),
        "NotoSans-SemiBold": require("../../../assets/fonts/NotoSans-SemiBold.ttf"),
    })

    if (!fontsLoaded) {
        return undefined
    }


    if (isLoading) {
        return <LoadingModal isLoading={isLoading} />
    }

    return (
        <View style={{ height: "100%" }}>
            <Text style={styles.headerTitle}>Other Messages</Text>
            <FlatList
                data={listData}
                renderItem={({ item }) => (
                    <ScrollView>
                        <TouchableHighlight
                            activeOpacity={0.6}
                            underlayColor="#DDDDDD"
                            style={styles.container}
                            onPress={() => navigation.navigate("Inbox-details", {
                                user: item.user,
                                address: item.address,
                                createdAt: item.createdAt,
                            })}
                        >
                            <View>
                                <View style={styles.itemContainer}>
                                    <FontAwesome
                                        name="envelope"
                                        size={18}
                                        color="#828282"
                                    />
                                    <Text style={styles.text}>You request to send your location</Text>
                                    <Text style={[styles.text, { color: "gray" }]}>
                                        {requestedOn(item.createdAt.nanoseconds, item.createdAt.seconds)}
                                    </Text>
                                </View>
                                <Text style={[styles.text, { color: "gray", marginLeft: 35 }]}>
                                    {item.address.streetNumber} {item.address.street}
                                </Text>
                            </View>
                        </TouchableHighlight>
                    </ScrollView>
                )}
            />
        </View>
    )
}

export default InboxScreen;

const styles = StyleSheet.create({
    headerTitle: {
        margin: 10,
        marginLeft: 15,
        fontSize: 17,
        fontFamily: "NotoSans-SemiBold"
    },
    text: {
        fontSize: 12,
        fontFamily: "NotoSans-Medium"
    },
    container: {
        padding: 20,
        shadowColor: '#000',
        elevation: 2,
        borderTopWidth: 1,
        borderTopColor: "transparent"
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 10,
        marginLeft: 5,
    },
})