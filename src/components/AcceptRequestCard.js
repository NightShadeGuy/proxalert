import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Linking,
    ScrollView
} from 'react-native'
import React from 'react'
import { defaultTheme } from '../shared/utils'
import { db } from '../config/firebase';
import {
    MaterialCommunityIcons,
    MaterialIcons,
    Ionicons
} from '@expo/vector-icons';
import { updateDoc, doc } from 'firebase/firestore';

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
    setCompletedRequestShowModal
}) => {

    const cancelEmergencyRequest = async (docId) => {
        try {
            const emergencyRequestRef = doc(db, "emergency-request", docId);

            await updateDoc(emergencyRequestRef, {
                emergencyStatus: "waiting",
                responderUid: null,
                responder: null,
                direction: null
            });

            console.log("Cancel request successfully from responder");
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

            setCompletedRequestShowModal(true);
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.overlayContainer}
            onPress={() => moveCamera(latitude, longitude, 0.0922, 0.0421)}
        >
            {accountDetails.isResponder ? (
                <View style={styles.row}>
                    <Image
                        source={{ uri: photoUrl }}
                        style={styles.image}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>{name}</Text>
                        <Text style={styles.text}>{emergencyType} · {contactNumber}</Text>
                        <Text style={styles.text}>{fullAddress}</Text>
                    </View>
                    <View>
                        <ScrollView 
                           showsVerticalScrollIndicator={false}
                        >
                            <TouchableOpacity
                                style={[styles.button, { marginTop: 5}]}
                                onPress={() => cancelEmergencyRequest(documentId)}
                            >
                                <MaterialCommunityIcons name="cancel" size={24} color="red" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: "#4caf50", marginTop: 5 }]}
                                onPress={() => handleCompletedShowModal(documentId)}
                            >
                                <MaterialIcons name="done" size={24} color="white" />

                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: "#4caf50", marginTop: 5 }]}
                                onPress={() => Linking.openURL(`tel:${contactNumber}`)}
                            >
                                <Ionicons name="call-sharp" size={24} color="white" />

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
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>Responder: {name}</Text>
                        <Text style={styles.text}>{contactNumber}</Text>
                    </View>
                    <View style={{ rowGap: 10 }}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => cancelEmergencyRequest(documentId)}
                        >
                            <MaterialCommunityIcons name="cancel" size={24} color="red" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: "#4caf50" }]}
                            onPress={() => Linking.openURL(`tel:${contactNumber}`)}
                        >
                            <Ionicons name="call-sharp" size={24} color="white" />

                        </TouchableOpacity>
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
    }
})