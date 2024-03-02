import { View, Modal, Image, Pressable } from 'react-native'
import React from 'react'

const UploadedPhotoModal = ({ showModal, setShowModal, picture }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={showModal}
            onRequestClose={() => setShowModal(!showModal)}
        >
            <Pressable
                style={{
                    flex: 1,
                    alignItems: 'center',
                    backgroundColor: "rgba(0, 0, 0, 9)",
                }}
                onPress={() => setShowModal(!showModal)}
            >
                <View
                    style={{
                        position: "absolute",
                        top: 150,
                        bottom: 150,
                        width: "100%",
                        justifyContent: "center",
                    }}
                >
                    <Image
                        source={{ uri: picture }}
                        style={{ flex: 1 }}
                    />
                </View>
            </Pressable>
        </Modal>
    )
}

export default UploadedPhotoModal