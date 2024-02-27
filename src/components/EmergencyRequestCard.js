import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Image
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather } from '@expo/vector-icons';
import {
    defaultTheme,
    toast,
    emergencyRequestRef,
    calendarFormat
} from '../shared/utils';
import {
    deleteDoc,
    doc,
    updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const EmergencyRequestCard = ({
    title,
    emptyTitle,
    showRequestModal,
    setShowRequestModal,
    accountDetails,
    emergencyRequest,
    latitude,
    longitude,
    moveToRegion,
    photoUrl
}) => {
    const deleteEmergencyRequest = async (id) => {
        try {
            await deleteDoc(doc(emergencyRequestRef, id));
        } catch (err) {
            toast(err.message);
        }
    }

    const acceptEmergencyRequestFromUser = async (user, id) => {
        try {
            const emergencyRequestRef = doc(db, "emergency-request", id);

            await updateDoc(emergencyRequestRef, {
                emergencyStatus: "accepted",
                responderUid: accountDetails.uid,
                responder: {
                    name: accountDetails.user,
                    contactNumber: accountDetails.contactNumber,
                    photoUrl,
                    latitude,
                    longitude,
                }
            }, { merge: true });
            moveToRegion(user.latitude, user.longitude, 0.0922, 0.0421)
        } catch (error) {
            console.error(error.message);
        } finally {
            setShowRequestModal(!showRequestModal);
        }
    }



    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showRequestModal}
            onRequestClose={() => setShowRequestModal(!showRequestModal)}
        >
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                }}
                onPress={() => setShowRequestModal(!showRequestModal)}
            >
                <View style={styles.container}>
                    <FlatList
                        data={emergencyRequest}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()} // Use index.toString() as the keyExtractor
                        //refreshing={false}
                        //onRefresh={loadMyEmergencyRequest}
                        renderItem={({ item, index }) => (
                            <View style={{ marginVertical: 6 }}>
                                <View>
                                    <View style={styles.row}>
                                        <Text style={styles.text}> Name: {item.user} </Text>
                                        <Text style={styles.text}>{calendarFormat(item.createdAt.nanoseconds, item.createdAt.seconds)}</Text>
                                    </View>
                                    <Text style={styles.text}>Contact number: {item.contactNumber}</Text>
                                    <Text style={styles.text}>Emergency type: {item.emergencyType}</Text>
                                    <Text style={styles.text}> Address: {item.fullAddress} </Text>
                                </View>

                                {!accountDetails.isResponder && (
                                    <View style={[styles.row, { justifyContent: "flex-end" }]}>
                                        <TouchableOpacity
                                            style={{
                                                paddingVertical: 5,

                                            }}
                                            onPress={() => deleteEmergencyRequest(item.id)}
                                        >
                                            <Text style={[styles.text, { color: "red" }]}>Cancel Request</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {accountDetails.isResponder ? (
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            style={[styles.button, {
                                                backgroundColor: "#d31539",
                                            }]}
                                        >
                                            <Text style={styles.btnText}>Decline</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.button, {
                                                backgroundColor: "#228353",
                                            }]}
                                            onPress={() => acceptEmergencyRequestFromUser(item, item.id)}
                                        >
                                            <Text style={styles.btnText}>Accept</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (

                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        marginHorizontal: 20,
                                        marginVertical: 5,
                                        paddingVertical: 10,
                                        paddingHorizontal: 10,
                                        backgroundColor: "#f3f3f3",
                                        borderRadius: 6
                                    }}>
                                        <ActivityIndicator size={30} color={defaultTheme} />
                                        <Text style={styles.text}>
                                            Waiting to accept, please wait...
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                        ListHeaderComponent={() => (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    paddingTop: 10,
                                    paddingHorizontal: 20
                                }}
                            >
                                <Text style={{
                                    fontFamily: "NotoSans-Bold",
                                    fontSize: 17,
                                    color: defaultTheme
                                }}>{title}</Text>
                                <TouchableOpacity
                                    activeOpacity={0.2}
                                    onPress={() => setShowRequestModal(!showRequestModal)}
                                >
                                    <Feather name="x" size={30} color="black" />
                                </TouchableOpacity>
                            </View>
                        )}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Image
                                    source={require("../../assets/images/icon.jpg")}
                                    style={{ width: 140, height: 140 }}
                                />
                                <Text style={styles.text}>{emptyTitle}</Text>
                            </View>
                        )}
                    />
                </View>
            </View>
        </Modal>
    )
}



export default EmergencyRequestCard

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        height: "55%",
        width: "100%",
        justifyContent: "center",
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20

    },
    text: {
        color: "gray",
        fontFamily: "NotoSans-Medium",
        paddingHorizontal: 20
    },
    loading: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 5,
        paddingVertical: 5,
        marginHorizontal: 20,
        marginVertical: 10,

        columnGap: 10,
        backgroundColor: "#f0f1f0",
        borderRadius: 7,
        margin: 5
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        height: 300,
    },
    buttonContainer: {
        flexDirection: "row",
        columnGap: 10,
        marginHorizontal: 20,
        marginVertical: 10
    },
    button: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: "#abb8c3"
    },
    btnText: {
        color: "white",
        fontFamily: "NotoSans-Bold",
        textAlign: "center"
    }



})
