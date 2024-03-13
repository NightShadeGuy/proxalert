import {
    StyleSheet,
    Text,
    View,
    Modal,
    Pressable,
    TouchableHighlight,
    Image,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import React, { useState, useLayoutEffect } from 'react';
import {
    FontAwesome,
    Feather,
    MaterialIcons
} from '@expo/vector-icons';
import moment from "moment";
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import { defaultPhoto, emergencyRequestRef, toast } from '../../shared/utils';
import { doc, deleteDoc } from "firebase/firestore";
import StatusModal from "../../components/StatusModal";
import MapView, {
    Marker,
    Polyline,
    PROVIDER_GOOGLE
} from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storage } from '../../config/firebase';
import { ref, deleteObject } from 'firebase/storage';

const InboxViewDetails = ({ user, accountDetails }) => {
    const navigation = useNavigation();
    const route = useRoute();
    const { name,
        id,
        createdAt: { nanoseconds, seconds },
        address: { city, district, region, street, streetNumber },
        emergencyType,
        latitude,
        longitude,
        photoUrl,
        proofPhotoUrl,
        responder
    } = route.params;

    console.log(route);

    const [showDeleteMessage, setShowDeleteMessage] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showProofImage, setShowProofImage] = useState(false);

    const latitudeDelta = 0.0922;
    const longitudeDelta = 0.0421;

    const calendarFormat = (nanoseconds, seconds) => {
        const milliseconds = seconds * 1000 + nanoseconds / 1e6;
        return moment(milliseconds).calendar();
    }

    const deleteCurrentInbox = async () => {
        setIsDeleting(true);
        setShowDeleteMessage(false);
        try {
            await deleteDoc(doc(emergencyRequestRef, id));
            await deleteImageFromStorage(proofPhotoUrl);
        } catch (err) {
            toast(err.message);
        } finally {
            setIsDeleting(false);
            navigation.navigate("Inbox");
        }
    }

    const deleteImageFromStorage = async (imageUrl) => {
        if (!imageUrl) return;

        const imageRef = ref(storage, imageUrl);

        try {
            await deleteObject(imageRef);
            console.log('Image deleted successfully');
        } catch (error) {
            console.error('Error deleting image:', error.message);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableHighlight
                    activeOpacity={0.6}
                    underlayColor="rgba(0, 0, 0, 0.5)"
                    style={{ position: "absolute", right: 0, borderRadius: 20 }}
                    onPress={() => setShowDeleteMessage(!showDeleteMessage)}>
                    <MaterialIcons
                        name="delete-outline"
                        size={30}
                        color="white"
                    />
                </TouchableHighlight>
            )
        })
    }, [])

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: "#edf2f8" }}
            showsVerticalScrollIndicator={false}
        >
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
                </View>

                <View style={{ alignItems: "center", paddingTop: 20 }}>
                    <Image
                        source={{ uri: accountDetails?.isResponder ? (photoUrl || defaultPhoto) : (responder.photoUrl || defaultPhoto) }}
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            alignItems: "center"
                        }}
                    />
                    {!accountDetails?.isResponder && (
                        <Text style={styles.textDetails}>Responder: {responder.name}</Text>
                    )}
                    <Text style={[styles.textTitle, { textAlign: "center" }]}>
                        {accountDetails?.isResponder
                            ? `My emergency response for ${name}`
                            : `Congratulations!, ${responder.name} completed your request`
                        }
                    </Text>
                </View>


                <MapView
                    style={{ width: "100%", height: 300 }}
                    region={{
                        latitude,
                        longitude,
                        latitudeDelta,
                        longitudeDelta,
                        altitude: 0
                    }}
                    provider={PROVIDER_GOOGLE}
                >

                    {latitude && longitude && (
                        <Marker
                            coordinate={{
                                latitude,
                                longitude,
                                latitudeDelta,
                                longitudeDelta,
                                altitude: 0
                            }}
                            title={name}
                        >
                            {user.photoURL && (
                                <Image
                                    source={{ uri: photoUrl }}
                                    style={{
                                        height: 40,
                                        width: 40,
                                        borderRadius: 20,
                                    }}
                                />
                            )}

                            {!photoUrl && (
                                <MaterialCommunityIcons
                                    name="human-handsup"
                                    size={40}
                                    color="green"
                                />
                            )}
                        </Marker>
                    )}

                    {responder && responder.latitude && responder.longitude && (
                        <Marker
                            coordinate={{
                                latitude: responder.latitude,
                                longitude: responder.longitude,
                                latitudeDelta,
                                longitudeDelta,
                                altitude: 0
                            }}
                            title={responder.name}
                        >
                            {user.photoURL ? (
                                <Image
                                    source={{ uri: responder.photoUrl }}
                                    style={{
                                        height: 40,
                                        width: 40,
                                        borderRadius: 20,
                                    }}
                                />
                            ) : (
                                <Image
                                    source={{ uri: "https://i.pinimg.com/564x/c2/c9/94/c2c994ac29361808c93c913338ad69b3.jpg" }}
                                    style={{
                                        height: 40,
                                        width: 40,
                                        borderRadius: 20,
                                    }}
                                />
                            )}
                        </Marker>
                    )}
                </MapView>


                <Text style={styles.textDetails}>
                    {accountDetails?.isResponder ? "User Details" : "My Details"}
                </Text>
                <View style={{ paddingHorizontal: 10 }}>
                    {name && (<Text style={styles.text}>Name: {name}</Text>)}
                    {emergencyType && (<Text style={styles.text}>Emergency type: {emergencyType}</Text>)}
                    {region && (<Text style={styles.text}>Region: {region}</Text>)}
                    {city && (<Text style={styles.text}>City: {city}</Text>)}
                    {district && (<Text style={styles.text}>District: {district}</Text>)}
                    {streetNumber && (<Text style={styles.text}>Street Number: {streetNumber}</Text>)}
                    {street && (<Text style={styles.text}>Street: {street}</Text>)}
                </View>

                {proofPhotoUrl && (
                    <View>
                        <Text style={styles.textDetails}>
                            {accountDetails?.isResponder ? "Proof Image Attached" : "My Uploaded Image"}
                        </Text>

                        <View style={{ position: "relative" }} >
                            <Image
                                source={{ uri: proofPhotoUrl }}
                                style={{ height: 300, width: "100%" }}
                                blurRadius={showProofImage ? 0 : 40}
                            />
                            {!showProofImage && (
                                <TouchableOpacity
                                    activeOpacity={0.4}
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: [{ translateX: -20 }, { translateY: -20 }]  // Adjust based on icon size
                                    }}
                                    onPress={() => setShowProofImage(!showProofImage)}
                                >
                                    <Feather name="eye" size={40} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

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
        </ScrollView>
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
        marginVertical: 5
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