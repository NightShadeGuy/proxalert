import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Linking,
    ScrollView
} from 'react-native'
import React, { useState, useEffect } from 'react'
import {
    defaultTheme,
    sendNotification,
    messagesRef
} from '../shared/utils'
import { db } from '../config/firebase';
import {
    MaterialCommunityIcons,
    MaterialIcons,
    Ionicons,
    AntDesign
} from '@expo/vector-icons';
import {
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    onSnapshot
} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const AcceptRequestCard = ({
    name,
    contactNumber,
    emergencyType,
    fullAddress,
    accountDetails,
    latitude,
    longitude,
    moveToRegion,
    moveCamera,
    documentId,
    photoUrl,
    setCompletedRequestShowModal,
    expoPushToken,
    responderExpoPushToken,
    acceptedRequest
}) => {
    const navigation = useNavigation()
    const [allMessages, setAllMessages] = useState();

    const cancelEmergencyRequest = async (docId) => {
        try {
            const emergencyRequestRef = doc(db, "emergency-request", docId);

            await updateDoc(emergencyRequestRef, {
                emergencyStatus: "waiting",
                responderUid: null,
                responder: null,
                direction: null
            });

            sendNotification([expoPushToken, responderExpoPushToken], "Request Got Cancelled", "");
            deleteMessages();
            console.log("Cancel request successfully to DB");
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleCompletedShowModal = async (docId) => {
        try {
            const emergencyRequest = doc(db, "emergency-request", docId);
            await updateDoc(emergencyRequest, {
                showCompletedModal: true
            })
            deleteMessages();

            setCompletedRequestShowModal(true);
        } catch (error) {
            console.error(error.message);
        }
    }


    const loadMessages = async () => {
        const q = query(messagesRef,
            where("senderUid", "in", [acceptedRequest.uid, acceptedRequest.responderUid]),
            orderBy("createdAt", "asc")
        )

        onSnapshot(q, (querySnapshot) => {
            const messages = querySnapshot.docs.map(doc => (
                { ...doc.data(), id: doc.id }
            ))
            setAllMessages(messages);
            console.log("AcceptRequestCard messages", messages);
        })
    }

    useEffect(() => {
        loadMessages();
    }, [])

    const deleteMessages = async () => {
        try {
            if (allMessages.length > 0) {
                for (let message of allMessages) {
                    await deleteDoc(doc(messagesRef, message.id));
                    //console.log("Should be delete", message);
                }
                console.log("Conversation Deleted Successfully");
            }
        } catch (err) {
            console.error(err.message)
        }
    }

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.overlayContainer}
            onPress={() => moveCamera(latitude, longitude, 0.0922, 0.0421)}
        >
            {accountDetails?.isResponder ? (
                <View style={styles.row}>
                    <Image
                        source={{ uri: photoUrl }}
                        style={styles.image}
                    />
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{ flex: 1 }}
                    >
                        <Text style={styles.headerTitle}>{name}</Text>
                        <Text style={styles.text}>{emergencyType} · {contactNumber}</Text>
                        <Text style={styles.text}>{fullAddress}</Text>
                    </ScrollView>
                    <View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonBorder, { borderColor: "gray" }]}
                                onPress={() => cancelEmergencyRequest(documentId)}
                            >
                                <MaterialCommunityIcons name="cancel" size={24} color="red" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonBorder]}
                                onPress={() => Linking.openURL(`tel:${contactNumber}`)}
                            >
                                <Ionicons name="call-sharp" size={24} color="#228353" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonBorder]}
                                onPress={() => navigation.navigate("Chat", acceptedRequest)}
                            >
                                <AntDesign name="message1" size={20} color="#228353" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonBorder, { backgroundColor: "#4caf50", marginTop: 5 }]}
                                onPress={() => handleCompletedShowModal(documentId)}
                            >
                                <MaterialIcons name="done" size={24} color="white" />
                            </TouchableOpacity>

                        </ScrollView>
                    </View>
                </View>
            ) : (
                <View style={styles.row}>
                    <Image
                        source={{ uri: photoUrl }}
                        style={styles.image}
                    />
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{ flex: 1 }}
                    >
                        <Text style={styles.headerTitle}>Responder: {name}</Text>
                        <Text style={styles.text}>{contactNumber}</Text>
                    </ScrollView>
                    <View style={{ rowGap: 10 }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonBorder, { borderColor: "gray" }]}
                                onPress={() => cancelEmergencyRequest(documentId)}
                            >
                                <MaterialCommunityIcons name="cancel" size={24} color="red" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonBorder]}
                                onPress={() => Linking.openURL(`tel:${contactNumber}`)}
                            >
                                <Ionicons name="call-sharp" size={24} color="#228353" />

                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonBorder]}
                                onPress={() => navigation.navigate("Chat", acceptedRequest)}
                            >
                                <AntDesign name="message1" size={20} color="#228353" />
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            )
            }
        </TouchableOpacity >
    )
}

export default AcceptRequestCard

const styles = StyleSheet.create({
    overlayContainer: {
        position: 'absolute',
        backgroundColor: 'white',
        bottom: 0,
        width: "100%",
        height: "16%",
        backgroundColor: defaultTheme
    },
    image: {
        height: 50,
        width: 50,
        borderRadius: 25,
    },
    row: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        columnGap: 10
    },
    headerTitle: {
        color: "white",
        fontSize: 17,
        fontFamily: "NotoSans-Bold",
    },
    text: {
        fontFamily: "NotoSans-SemiBold",
        color: "white",
        fontSize: 12
    },
    button: {
        backgroundColor: "whitesmoke",
        height: 40,
        width: 40,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonBorder: {
        backgroundColor: "white",
        marginTop: 5,
        borderWidth: 2,
        borderColor: "#228353"
    }
})