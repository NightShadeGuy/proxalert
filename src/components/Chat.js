import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Modal,
    Pressable,
} from 'react-native'
import React, { useState } from 'react'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { calendarFormat, defaultPhoto } from '../shared/utils';

const Chat = ({
    user,
    item,
    index,
    showMessagePress,
    setShowMessagePress,
    showEditMessage,
    setShowEditMessage,
    unsendMessage,
    updateMessage
}) => {
    const [editMessage, setEditMessage] = useState("");

    console.log("update message", editMessage);

    return (
        <>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: user.uid === item.senderUid ? "flex-end" : "flex-start",
                    columnGap: 10,
                }}
            >

                {user.uid !== item.senderUid && (
                    <Image
                        source={{ uri: (item.senderPhotoUrl || defaultPhoto) }}
                        style={styles.profile}
                    />
                )}
                <Pressable
                    android_ripple={{ color: 'silver', borderless: false, }}
                    style={[styles.message, {
                        backgroundColor: user.uid === item.senderUid ? "#0693e3" : "rgba(245, 245, 245, 0.9)",
                        flexDirection: "row",
                        columnGap: 7,
                        position: "relative",
                        marginRight: showEditMessage[index] && 30
                    }]}
                    onLongPress={() => {
                        if (user.uid === item.senderUid) {
                            setShowMessagePress(prevState => ({
                                ...prevState,
                                [index]: !prevState[index]
                            }));
                        }
                    }}
                >
                    {showEditMessage[index] ? (
                        <TextInput
                            style={{
                                color: user.uid === item.senderUid ? "white" : "black",
                                fontFamily: "NotoSans-Medium",
                                width: 190,
                            }}
                            multiline
                            onChangeText={text => setEditMessage(text)}
                            value={editMessage || item.message}
                        />
                    ) : (
                        <Text
                            style={{
                                color: user.uid === item.senderUid ? "white" : "black",
                                fontFamily: "NotoSans-Medium",
                                width: 190,
                            }}
                        >
                            {item.message}
                        </Text>
                    )}

                    <Text
                        style={[styles.nameText, {
                            right: 0,
                        }]}
                    >
                        {user.uid !== item.senderUid && item.senderName.split(" ")[0]}  {calendarFormat(item.createdAt?.nanoseconds, item.createdAt?.seconds)} {item.edited && "- Edited"}
                    </Text>

                    {showEditMessage[index] && (
                        <TouchableOpacity
                            style={{
                                position: "absolute",
                                top: 0,
                                right: -40
                            }}
                            onPress={() => {
                                setShowEditMessage(prevState => ({
                                    ...prevState,
                                    [index]: !prevState[index]
                                }))

                                if (editMessage.length > 0) {
                                    updateMessage(item.id, editMessage);
                                }
                            }}
                        >
                            <AntDesign name="check" size={30} color="green" />
                        </TouchableOpacity>
                    )}
                </Pressable>
                <Text></Text>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showMessagePress[index]}
                    onRequestClose={() => {
                        setShowMessagePress(prevState => ({
                            ...prevState,
                            [index]: !prevState[index]
                        }));
                    }}
                >
                    <Pressable
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                        }}
                        onPress={() => {
                            setShowMessagePress(prevState => ({
                                ...prevState,
                                [index]: !prevState[index]
                            }));
                        }}
                    >
                        <View
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: [{ translateX: -150 }, { translateY: -150 }],
                                height: 200,
                                width: 300,
                                backgroundColor: "white",
                                borderRadius: 20
                            }}
                        >
                            <Text style={styles.messageModalTitle}>Message</Text>
                            <Pressable
                                android_ripple={{ color: 'silver', borderless: false, }}
                                style={styles.messageModalButton}
                                onPress={() => {
                                    if (user.uid === item.senderUid) {
                                        unsendMessage(item.id, index)
                                    }
                                }}
                            >
                                <MaterialCommunityIcons name="delete-alert-outline" size={24} color="black" />
                                <Text style={styles.messageModalText}>Unsend</Text>
                            </Pressable>
                            <Pressable
                                android_ripple={{ color: 'silver', borderless: false }}
                                style={styles.messageModalButton}
                                onPress={() => {
                                    setShowEditMessage(prevState => ({
                                        ...prevState,
                                        [index]: !prevState[index]
                                    }));
                                    setShowMessagePress(prevState => ({
                                        ...prevState,
                                        [index]: !prevState[index]
                                    }));
                                }}
                            >
                                <AntDesign name="edit" size={20} color="black" />
                                <Text style={styles.messageModalText}>Edit</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            </View>

        </>
    )
}

export default Chat

const styles = StyleSheet.create({
    profile: {
        width: 45,
        height: 45,
        borderRadius: 22.5
    },
    nameText: {
        position: 'absolute',
        top: -20,
        fontSize: 12,
        color: "silver",
        fontStyle: "italic",
    },
    message: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 12,
        minWidth: 150,
    },
    messageModalTitle: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        fontSize: 23,
        fontFamily: "NotoSans-SemiBold"
    },
    messageModalText: {
        fontSize: 15,
        fontFamily: "NotoSans-Medium",
    },
    messageModalButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        columnGap: 5
    }
})