import {
    StyleSheet,
    Text,
    View,
    Modal,
    Pressable,
    TouchableHighlight
} from 'react-native';
import React, { useState } from 'react';
import {
    FontAwesome,
    Feather,
    MaterialIcons
} from '@expo/vector-icons';
import moment from "moment";
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import { locationRef, toast } from '../../../utils';
import { doc, deleteDoc } from "firebase/firestore";
import StatusModal from "../../components/StatusModal";

const InboxViewDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {
        user,
        id,
        createdAt: { nanoseconds, seconds },
        address: { city, district, region, street, streetNumber }
    } = route.params;

    console.log(route);

    const [showDeleteMessage, setShowDeleteMessage] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const calendarFormat = (nanoseconds, seconds) => {
        const milliseconds = seconds * 1000 + nanoseconds / 1e6;
        return moment(milliseconds).calendar();
    }

    const deleteCurrentInbox = async () => {
        setIsDeleting(true);
        setShowDeleteMessage(false);
        try {
            await deleteDoc(doc(locationRef, id));
        } catch (err) {
            toast(err.message);
        } finally {
            setIsDeleting(false);
            navigation.navigate("Inbox");
        }
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
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                    <Text style={[styles.text, { textAlign: "center" }]}>
                        {calendarFormat(nanoseconds, seconds)}
                    </Text>
                    <TouchableHighlight
                        activeOpacity={0.6}
                        underlayColor="#DDDDDD"
                        style={{ position: "absolute", right: 0, borderRadius: 5 }}
                        onPress={() => setShowDeleteMessage(!showDeleteMessage)}>
                        <MaterialIcons
                            name="delete-outline"
                            size={30}
                            color="red"
                        />
                    </TouchableHighlight>
                </View>
                <Text style={[styles.textTitle, { textAlign: "center" }]}>
                    You requested to saved your location
                </Text>
                <Text style={styles.textDetails}>Details</Text>
                <View style={{ paddingHorizontal: 10 }}>
                    <Text style={styles.text}>Name: {user}</Text>
                    <Text style={styles.text}>ID: {id} {/* Temporary displaying this id */}</Text>
                    <Text style={styles.text}>Region: {region}</Text>
                    <Text style={styles.text}>City: {city}</Text>
                    <Text style={styles.text}>District: {district}</Text>
                    <Text style={styles.text}>Street Number: {streetNumber}</Text>
                    <Text style={styles.text}>Street: {street}</Text>
                </View>
            </View>

            <Modal
                animationType='slide'
                transparent
                visible={showDeleteMessage}
                onRequestClose={() => setShowDeleteMessage(!showDeleteMessage)}
            >
                <Pressable
                    style={styles.modalContainer}
                    onPress={() => setShowDeleteMessage(!showDeleteMessage)}
                >
                    <View style={styles.modalView}>
                        <View>
                            <View style={styles.modalTitle}>
                                <Text style={styles.modalTitleText}>Delete Message?</Text>
                                <Feather
                                    name="x"
                                    size={24}
                                    color="black"
                                    onPress={() => setShowDeleteMessage(!showDeleteMessage)}
                                />
                            </View>
                            <Text style={styles.text}>
                                Deleted messages are gone forever. This action can't be undone. Are you sure you want to delete this message?
                            </Text>
                            <View style={styles.buttonContainer}>
                                <CustomButton
                                    title="Yes"
                                    style={[styles.button, styles.yesButton]}
                                    textStyle={[styles.text, { textAlign: "center", marginTop: 6 }]}
                                    textColor="white"
                                    onPress={deleteCurrentInbox}
                                />
                                <CustomButton
                                    title="No"
                                    style={[styles.button, styles.noButton]}
                                    textStyle={[styles.text, { textAlign: "center", marginTop: 4 }]}
                                    textColor="red"
                                    onPress={() => setShowDeleteMessage(!showDeleteMessage)}
                                />
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Modal>

            {isDeleting && (
                <StatusModal
                    status={isDeleting}
                    message="Deleting..."
                />
            )}
        </View>
    )
}

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
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)"
    },
    modalView: {
        backgroundColor: "white",
        width: "100%",
        paddingVertical: 20,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingLeft: 20,
        columnGap: 20,
        borderRadius: 4,
    },
    modalTitle: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

    },
    modalTitleText: {
        fontSize: 18,
        fontFamily: "NotoSans-Bold"
    },
    buttonContainer: {
        justifyContent: "center",
        alignItems: "center",
        rowGap: 5,
        paddingVertical: 20
    },
    button: {
        width: "95%",
        height: 37,
        borderRadius: 20
    },
    yesButton: {
        backgroundColor: "#D64045",
    },
    noButton: {
        backgroundColor: "white",
        borderWidth: 2,
        borderColor: "#D64045"
    },
})

export default InboxViewDetails;