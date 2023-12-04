import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
    onSnapshot,
    query,
    where,
    orderBy
} from "firebase/firestore";
import { auth } from "../../config/firebase";
import { FontAwesome } from '@expo/vector-icons';
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import { locationRef } from "../../../utils";

const InboxScreen = () => {
    const navigation = useNavigation();
    const [listData, setListData] = useState([]);
    console.log(listData);

    //This will fetch list of saved user location
    const loadAllRequestSaved = async () => {
        try {
            const userId = auth.currentUser.uid;

            // Get the generated location only for the person that is currently logged in.
            const q = query(locationRef, where("uid", "==", userId), orderBy("createdAt", "desc"));

            onSnapshot(q, (querySnapshot) => {
                setListData(querySnapshot.docs.map(doc => (
                    {...doc.data(), id: doc.id}    //created a new object to include the document id
                )));
                console.log("query-snapshot", listData);
            })
        } catch (err) {
            console.error(err.message)
        }
    }

    useEffect(() => {
        loadAllRequestSaved();
    }, [])

    const calendarFormat = (nanoseconds, seconds) => {
        if (!nanoseconds || !seconds) {
            return "Date processing"
        }

        const milliseconds = seconds * 1000 + nanoseconds / 1e6; // Convert nanoseconds to milliseconds

        if (milliseconds >= 86400000) {   // attain a duration of one day or more
            return moment(milliseconds).format("MMM Do YYYY");
        }
        return moment(milliseconds).startOf("hour").fromNow();
    }

    return (
        <View style={{backgroundColor: "white", flex: 1 }}>
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
                                id: item.id,
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
                                        {calendarFormat(item.createdAt?.nanoseconds, item.createdAt?.seconds)}
                                    </Text>
                                </View>
                                <Text style={[styles.text, { color: "gray", marginLeft: 35 }]}>
                                    {item.address.streetNumber} {item.address.street}
                                </Text>
                            </View>
                        </TouchableHighlight>
                    </ScrollView>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Image
                           source={require("../../../assets/images/icon.jpg")}
                           style={{width: 140, height: 140}}
                        />
                        <Text style={styles.text}>You don't have any inbox messages</Text>
                    </View>
                )}
            />
        </View>
    )
}

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
    emptyContainer: {
        marginVertical: "50%",
        justifyContent: "center",
        alignItems: "center",
    }
})

export default InboxScreen;