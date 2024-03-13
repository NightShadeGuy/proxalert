import { View, Text, Modal, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../config/firebase';
import { defaultPhoto, defaultTheme } from '../shared/utils';

const CompletedRequestModal = ({
    showModal,
    setShowModal,
    documentId,
    name,
    photoUrl,
    accountDetails
}) => {

    const completedEmergencyRequest = async (docId) => {
        try {
            const emergencyRequest = doc(db, "emergency-request", docId);
            await updateDoc(emergencyRequest, {
                emergencyStatus: "completed",
                showCompletedModal: false
            })
            setShowModal(!showModal);
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <Modal
            animationType="fade"
            visible={showModal}
            onRequestClose={() => completedEmergencyRequest(documentId)}
        >
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    backgroundColor: "white",
                }}
            >
                <View>
                    {accountDetails.isResponder ? (
                        <View style={styles.container}>
                            <Image
                                source={require("../../assets/images/thankyou.jpg")}
                                style={{ width: 300, height: 100 }}
                            />
                            <View style={{ alignItems: 'center', rowGap: 10 }} >
                                <Image
                                    source={{ uri: (photoUrl || defaultPhoto) }}
                                    style={styles.userProfile}
                                />
                                <Text style={[styles.text, { fontSize: 20, color: defaultTheme }]}>{name}</Text>
                            </View>
                            <Text style={styles.text}>We truly appreciate it! You've fulfilled {name} emergency requirement satisfactorily.</Text>
                        </View>

                    ) : (
                        <View style={styles.container}>

                            <Image
                                source={require("../../assets/images/thankyou.jpg")}
                                style={{ width: 300, height: 100 }}
                            />
                            <View style={{ alignItems: 'center', rowGap: 10 }} >
                                <Image
                                    source={{ uri: (photoUrl || defaultPhoto) }}
                                    style={styles.userProfile}
                                />
                                <Text style={[styles.text, { fontSize: 20, color: defaultTheme }]}>{name}</Text>
                            </View>
                            <Text style={styles.text}>Responder {name}, confirmed that your request is now completed.</Text>

                        </View>
                    )}
                    <TouchableOpacity
                        activeOpacity={0.6}
                        style={{ height: 100, paddingHorizontal: 20 }}
                        onPress={() => completedEmergencyRequest(documentId)}
                    >
                        <Text style={[styles.button, styles.buttontext]}>Continue</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </Modal>
    )
}

export default CompletedRequestModal

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        rowGap: 50,
        paddingHorizontal: 20
    },
    text: {
        fontSize: 14,
        color: "black",
        fontFamily: "NotoSans-SemiBold",
        textAlign: "center"
    },
    button: {
        paddingVertical: 10,
        backgroundColor: defaultTheme,
        borderRadius: 20
    },
    buttontext: {
        fontSize: 15,
        color: "white",
        fontFamily: "NotoSans-SemiBold",
        textAlign: "center"
    },
    userProfile: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: defaultTheme
    }
})