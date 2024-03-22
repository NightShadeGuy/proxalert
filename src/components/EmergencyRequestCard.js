import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather } from '@expo/vector-icons';
import {
    defaultTheme,
    toast,
    emergencyRequestRef,
    calendarFormat,
    sendNotification,
    useDefaultPhoto
} from '../shared/utils';
import {
    deleteDoc,
    doc,
    updateDoc
} from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, deleteObject } from 'firebase/storage';
import UploadedPhotoModal from './UploadedPhotoModal';


const EmergencyRequestCard = ({
    title,
    emptyTitle,
    showRequestModal,
    setShowRequestModal,
    accountDetails,
    emergencyRequest,
    setEmergencyRequest,
    latitude,
    longitude,
    moveToRegion,
    photoUrl,
    currentCity,
    loadEmergencyRequest,
    expoPushToken
}) => {
    const [showUploadedPhoto, setShowUploadedPhoto] = useState({});
    const [selectFilter, setSelectFilter] = useState("all");

    //console.log("SelectFilter", selectFilter, currentCity);
    //console.log("ShowUploadedPhoto", showUploadedPhoto);

    useEffect(() => {
        // Create initial state for showUploadedPhoto based on emergencyRequest length
        setShowUploadedPhoto(
            Array.from({ length: emergencyRequest.length }, () => false)
        );
    }, [emergencyRequest]);

    const deleteEmergencyRequest = async (id, imageUrl) => {
        try {
            await deleteDoc(doc(emergencyRequestRef, id));
            await deleteImageFromStorage(imageUrl);
        } catch (err) {
            toast(err.message);
        }
    }

    const deleteImageFromStorage = async (imageUrl) => {
        if (!imageUrl) return;

        // Create a reference to the image in Firebase Storage
        const imageRef = ref(storage, imageUrl);

        try {
            // Delete the image from Firebase Storage
            await deleteObject(imageRef);
            console.log('Image deleted successfully');
        } catch (error) {
            console.error('Error deleting image:', error.message);
        }
    };

    const acceptEmergencyRequestFromUser = async (user, id) => {
        try {
            const emergencyRequestRef = doc(db, "emergency-request", id);

            await updateDoc(emergencyRequestRef, {
                emergencyStatus: "accepted",
                responderUid: accountDetails.uid,
                responder: {
                    name: accountDetails.user,
                    contactNumber: accountDetails.contactNumber,
                    notificationToken: expoPushToken,
                    sortResponder: accountDetails.sortResponder,
                    photoUrl: photoUrl ? photoUrl : useDefaultPhoto(accountDetails.isResponder, accountDetails.sortResponder).vehicleIcon,
                    latitude,
                    longitude,
                }
            }, { merge: true });
            moveToRegion(user.latitude, user.longitude, 0.0922, 0.0421);
            sendNotification(
                user.notificationToken,
                "Your request has been accepted.",
                `Respondent ${accountDetails.user} is prepared to go to your area.`
            );
        } catch (error) {
            console.error(error.message);
        } finally {
            setShowRequestModal(!showRequestModal);
        }
    }

    const filterEmergencyRequest = (city) => {
        setSelectFilter(city)

        let filteredRequest;

        if (city === currentCity) {
            filteredRequest = emergencyRequest.filter(info => info.address.city === currentCity);
            setEmergencyRequest(filteredRequest);
        } else {
            loadEmergencyRequest();
            console.log("Doesn't match", filteredRequest);
        }
    }

    return (
        <>
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
                >
                    <View style={[styles.container, {
                        height: accountDetails?.isResponder ? "55%" : "",
                    }]}>
                        <View
                            style={{
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                borderColor: "silver",
                                paddingHorizontal: 20
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}>
                                <Text
                                    style={{
                                        fontFamily: "NotoSans-Bold",
                                        fontSize: 17,
                                        color: defaultTheme
                                    }}
                                >
                                    {title}
                                </Text>
                                <TouchableOpacity
                                    activeOpacity={0.2}
                                    onPress={() => setShowRequestModal(!showRequestModal)}
                                >
                                    <Feather name="x" size={30} color="black" />
                                </TouchableOpacity>
                            </View>
                            {accountDetails?.isResponder && (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "flex-start",
                                        columnGap: 10
                                    }}
                                >
                                    <Text style={styles.filterText}>Filter:</Text>
                                    <TouchableOpacity
                                        style={[styles.filterButton, {
                                            backgroundColor: selectFilter === "all" ? "#228353" : "transparent"
                                        }]}
                                        onPress={() => filterEmergencyRequest("all")}
                                        disabled={selectFilter === "all"}
                                    >
                                        <Text
                                            style={[styles.filterText, {
                                                color: selectFilter === "all" ? "white" : "gray"
                                            }]}
                                        >
                                            All
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.filterButton, {
                                            backgroundColor: selectFilter === currentCity ? "#228353" : "transparent"
                                        }]}
                                        onPress={() => filterEmergencyRequest(currentCity)}
                                        disabled={selectFilter === currentCity}
                                    >
                                        <Text
                                            style={[styles.filterText, {
                                                color: selectFilter === currentCity ? "white" : "gray"
                                            }]}
                                        >
                                            My Current City
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <FlatList
                            data={emergencyRequest}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => (
                                <View style={{ marginVertical: 6 }}>
                                    <View>
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                            <Text style={[styles.text, styles.categoryText]}>
                                                Need: {item.requestedResponder === "Medical" ? "Ambulance" : item.requestedResponder}
                                            </Text>
                                            <Text style={[styles.text, { color: "silver" }]}>{calendarFormat(item.createdAt?.nanoseconds, item.createdAt?.seconds)}</Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Image
                                                source={{ uri: item.photoUrl ? item.photoUrl : "https://i.pinimg.com/564x/05/11/45/051145a8e366876f859378154aa7df8b.jpg" }}
                                                style={{ width: 50, height: 50, borderRadius: 25, marginHorizontal: 20 }}
                                            />
                                            <View>
                                                <Text style={styles.text}> Name: {item.user} </Text>
                                                <Text style={styles.text}>Contact number: {item.contactNumber}</Text>
                                            </View>
                                        </View>

                                        <Text style={styles.text}>Emergency type: {item.emergencyType}</Text>
                                        <Text style={styles.text}> Address: {item.fullAddress} </Text>
                                        {item.message && (
                                            <View style={styles.messageContainer}>
                                                <Text style={styles.text}>{item.message}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {!accountDetails?.isResponder && (
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: item.proofPhotoUrl ? "space-between" : "flex-end",
                                            }}
                                        >
                                            {item.proofPhotoUrl && (
                                                <View>
                                                    <TouchableOpacity
                                                        style={{ paddingVertical: 5 }}
                                                        onPress={() => {
                                                            setShowUploadedPhoto(prevState => ({
                                                                ...prevState,
                                                                [index]: !prevState[index]
                                                            }));
                                                        }}
                                                    >
                                                        <Text style={[styles.text, { color: "#4caf50" }]}>View uploaded photo</Text>
                                                    </TouchableOpacity>

                                                    <UploadedPhotoModal
                                                        showModal={showUploadedPhoto[index]}
                                                        setShowModal={newState => {
                                                            setShowUploadedPhoto(prevState => ({
                                                                ...prevState,
                                                                [index]: newState
                                                            }));
                                                        }}
                                                        picture={item.proofPhotoUrl}
                                                    />
                                                </View>
                                            )}

                                            <TouchableOpacity
                                                style={{
                                                    paddingVertical: 5,

                                                }}
                                                onPress={() => deleteEmergencyRequest(item.id, item.proofPhotoUrl)}
                                            >
                                                <Text style={[styles.text, { color: "red" }]}>Cancel Request</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {accountDetails?.isResponder ? (
                                        <>
                                            {item.proofPhotoUrl && (
                                                <>
                                                    <TouchableOpacity
                                                        style={{ paddingVertical: 5 }}
                                                        onPress={() => {
                                                            setShowUploadedPhoto(prevState => ({
                                                                ...prevState,
                                                                [index]: !prevState[index]
                                                            }));
                                                        }}
                                                    >
                                                        <Text style={[styles.text, { color: "#4caf50" }]}>View the Proof Attached</Text>
                                                    </TouchableOpacity>

                                                    <UploadedPhotoModal
                                                        showModal={showUploadedPhoto[index]}
                                                        setShowModal={newState => {
                                                            setShowUploadedPhoto(prevState => ({
                                                                ...prevState,
                                                                [index]: newState
                                                            }));
                                                        }}
                                                        picture={item.proofPhotoUrl}
                                                    />
                                                </>
                                            )}

                                            <View style={styles.buttonContainer}>
                                                <TouchableOpacity
                                                    style={[styles.button, {
                                                        backgroundColor: "#228353",
                                                    }]}
                                                    onPress={() => acceptEmergencyRequestFromUser(item, item.id)}
                                                >
                                                    <Text style={styles.btnText}>Accept</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </>
                                    ) : (
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            marginHorizontal: 20,
                                            marginVertical: 5,
                                            paddingVertical: 10,
                                            paddingHorizontal: 10,
                                            backgroundColor: "#f4f4f4",
                                            borderRadius: 6,
                                        }}>
                                            <ActivityIndicator size={30} color={defaultTheme} />
                                            <Text style={styles.text}>
                                                Waiting to accept, please wait...
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                            ItemSeparatorComponent={() => (
                                <View style={{ borderBottomWidth: 5, borderColor: "silver" }}></View>
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
        </>
    )
}



export default EmergencyRequestCard

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
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
    categoryText: {
        fontSize: 12,
        paddingVertical: 3,
        backgroundColor: "#e57373",
        color: "white",
        borderRadius: 20,
        marginLeft: 20
    },
    filterText: {
        fontFamily: "NotoSans-Medium",
        color: "gray",
        fontSize: 11
    },
    filterButton: {
        borderWidth: 1,
        borderColor: "silver",
        paddingHorizontal: 10,
        borderRadius: 20
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
        justifyContent: "space-between",
        columnGap: -15,
        flexDirection: "row-reverse",
        marginTop: 5
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        height: 300,
    },
    buttonContainer: {
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
    },
    messageContainer: {
        backgroundColor: "rgba(245, 245, 245, 0.5)",
        paddingVertical: 5,
        marginHorizontal: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: "rgba(225, 225, 225, 1)",
        borderRadius: 6
    }



})
