import {
    StyleSheet,
    Text,
    View,
    Modal,
    ActivityIndicator
} from 'react-native';
import React from 'react';

const StatusModal = ({ status, setStatus, message }) => {
    return (
        <View>
            <Modal
                transparent
                visible={status}
                onRequestClose={() => setStatus(!status)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <ActivityIndicator size={40} color="#0288D1" />
                        <Text style={{ fontFamily: "NotoSans-SemiBold", color: "gray" }}>
                            {message}
                        </Text>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)"
    },
    modalView: {
        backgroundColor: "white",
        width: "85%",
        paddingVertical: 20,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingLeft: 20,
        columnGap: 20,
        borderRadius: 4,
        shadowColor: '#000',
        elevation: 5
    }
})

export default StatusModal;