import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    FlatList,
    Alert,
} from 'react-native'
import React, {
    useEffect,
    useLayoutEffect,
    useState,
    useRef
} from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons';
import {
    defaultPhoto,
    defaultTheme,
    messagesRef,
    sendNotification,
    showToast
} from '../shared/utils';
import {
    addDoc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    query,
    where,
    orderBy,
    deleteDoc,
    doc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import Chat from '../components/Chat';

const ChatScreen = ({ user, accountDetails }) => {
    const navigation = useNavigation();
    const route = useRoute();
    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState([]);

    const [showMessagePress, setShowMessagePress] = useState({});
    const [showEditMessage, setShowEditMessage] = useState({});

    const flatListRef = useRef(null);

    console.log("Accepted Request data", route.params);
    //console.log("All Message", allMessages);
    //console.log("show message press", showMessagePress);
    //console.log("show edit message", showEditMessage);

    const {
        id,
        photoUrl,
        notificationToken,
        responder,
        responderUid,
        uid,
    } = route.params;
    const name = route.params.user;


    console.log("name");

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerStyle: {
                backgroundColor: defaultTheme,
            },
            headerTitle: "",
            headerLeft: () => (
                <View>
                    {accountDetails?.isResponder ? (
                        <View style={styles.headerLeftContainer}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Ionicons name="arrow-back-outline" size={24} color="white" />
                            </TouchableOpacity>
                            <Image
                                source={{ uri: (photoUrl || defaultPhoto) }}
                                style={styles.headerImage}
                            />
                            <Text style={styles.headerNameText}>{name}</Text>
                        </View>
                    ) : (
                        <View style={styles.headerLeftContainer}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Ionicons name="arrow-back-outline" size={24} color="white" />
                            </TouchableOpacity>
                            <Image
                                source={{ uri: (responder.photoUrl || defaultPhoto) }}
                                style={styles.headerImage}
                            />
                            <Text style={styles.headerNameText}>{responder.name}</Text>
                        </View>
                    )}
                </View>
            )
        })
    }, [])

    const sentMessageToDb = async () => {
        try {
            if (message.length !== 0) {
                const useToken = accountDetails?.isResponder ? notificationToken : responder.notificationToken

                const senderName = accountDetails?.isResponder ? responder.name : name;
                const senderUid = accountDetails?.isResponder ? responderUid : uid;
                const senderPhotoUrl = accountDetails?.isResponder ? responder.photoUrl : photoUrl;
                setMessage("");

                const docRef = await addDoc(messagesRef, {
                    senderName,
                    senderUid,
                    senderPhotoUrl,
                    message,
                    createdAt: serverTimestamp()
                });

                sendNotification(useToken, senderName, message);

                //showToast("Message sent", docRef.id);
            } else {
                Alert.alert("Error", "You have to type your message.");
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    const loadMessages = async () => {
        const q = query(messagesRef,
            where("senderUid", "in", [uid, responderUid]),
            orderBy("createdAt", "asc")
        )

        onSnapshot(q, (querySnapshot) => {
            const messages = querySnapshot.docs.map(doc => (
                { ...doc.data(), id: doc.id }
            ))
            setAllMessages(messages);
            console.log("ChatScreen messages", messages);
        })
    }

    useEffect(() => {
        loadMessages();
    }, [])


    useEffect(() => {
        setShowMessagePress(
            Array.from({ length: allMessages.length }, () => false)
        );
        setShowEditMessage(
            Array.from({ length: allMessages.length }, () => false)
        );
        scrollToBottom();
    }, [allMessages])

    const scrollToBottom = () => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    };

    const unsendMessage = async (documentId, index) => {
        try {
            await deleteDoc(doc(messagesRef, documentId));
            setShowMessagePress(prevState => ({
                ...prevState,
                [index]: !prevState[index]
            }));
        } catch (err) {
            console.error(err.message);
        }
    }

    const updateMessage = async (documentId, editedMessage) => {
        try {
            const messages = doc(db, "messages", documentId);
            await updateDoc(messages, {
                message: editedMessage,
                edited: true
            })
            showToast("Updated Successfully");
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                showsVerticalScrollIndicator={false}
                style={{
                    flex: 1,
                    paddingHorizontal: 10,
                    marginVertical: 15,
                }}
                data={allMessages}
                renderItem={({ item, index }) => (
                    <View style={{ marginVertical: 20 }}>
                        <Chat
                            user={user}
                            item={item}
                            index={index}
                            showMessagePress={showMessagePress}
                            setShowMessagePress={setShowMessagePress}
                            showEditMessage={showEditMessage}
                            setShowEditMessage={setShowEditMessage}
                            unsendMessage={unsendMessage}
                            updateMessage={updateMessage}
                        />
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 160,
                        }}
                    >
                        <Image
                            source={{ uri: accountDetails?.isResponder ? (photoUrl || defaultPhoto) : (responder.photoUrl || defaultPhoto) }}
                            style={{ width: 100, height: 100, borderRadius: 50 }}
                        />
                        <Text style={styles.emptyText}>{accountDetails?.isResponder ? name : responder.name}</Text>
                        <Text style={styles.emptyText}>Start your message right now.</Text>
                    </View>
                )}
                onContentSizeChange={scrollToBottom}
            //onLayout={scrollToBottom}
            />

            <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    multiline
                    placeholder='Type a message...'
                    onChangeText={text => setMessage(text)}
                    value={message}
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={sentMessageToDb}
                >
                    <Ionicons name="send" size={24} color={defaultTheme} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default ChatScreen

const styles = StyleSheet.create({
    headerLeftContainer: {
        flexDirection: "row",
        columnGap: 10
    },
    headerImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    headerNameText: {
        fontFamily: "NotoSans-Medium",
        color: "white"
    },
    container: {
        paddingHorizontal: 10,
        flex: 1,
        backgroundColor: "white"
    },
    emptyText: {
        fontFamily: "NotoSans-Medium",
        color: "gray"
    },
    input: {
        flex: 1,
        backgroundColor: "rgba(240, 240, 240, 0.5)",
        marginRight: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        fontFamily: "NotoSans-Medium",
        maxHeight: 80
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        columnGap: 5,
        marginVertical: 10
    },
    button: {
        width: 35
    }
})