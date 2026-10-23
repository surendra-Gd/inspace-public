import React, {useState} from "react";
import {shiftAdminAction} from "../../service/actions/spaceActions";
import {ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {rem} from "../../utils/uiUtils";


const ShiftAdminModal = ({targetUserId, targetUsername, onClose, dispatch, isVisible}) => {
    const [loading, setLoading] = useState(false);

    const handleChangeAdmin = async () => {
        setLoading(true);
        await dispatch(shiftAdminAction(targetUserId, onClose));
        setLoading(false);
    }

    return (
        <Modal visible={isVisible} transparent={true} onRequestClose={() => onClose()} animationType="fade">
            <View style={styles.modal}>
                <View style={styles.modalCard}>
                    <TouchableOpacity style={styles.modalClose} onPress={onClose}>
                        <Image source={require("../../assets/images/wrong.png")} style={{width:30, height:30}}/>
                    </TouchableOpacity>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>
                            Are you sure you want to transfer your admin role to <Text style={styles.username}>{targetUsername}</Text>?
                        </Text>
                        <Text style={styles.modalInfo}>This action cannot be undone.</Text>
                    </View>
                    <TouchableOpacity style={styles.modalConfirm}
                        onPress={handleChangeAdmin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Text style={styles.confirmText}>Shift Admin Role</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalCard: {
        position: "absolute",
        backgroundColor: "rgba(243,243,243,0.99)",
        alignSelf: "center",
        top: rem(20),
        paddingHorizontal: rem(1),
        paddingTop: rem(0.8),
        borderRadius: 14,
        borderCurve: "circular"
    },
    modalClose: {
        alignSelf: 'flex-end',
    },
    modalContent: {
        padding: rem(1),
        paddingHorizontal: rem(2)
    },
    modalText: {
        fontSize: rem(1.5),
        fontFamily: "Inter_600SemiBold",
        textAlign: 'center',
        marginBottom: rem(1.5),
        color: '#000',
    },
    modalInfo: {
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold",
        textAlign: 'center',
        color: '#6f6f6f',
    },
    username: {
        fontSize: rem(1.6),
        fontFamily: "Inter_700Bold",
        color: "#3c89fb"
    },
    modalConfirm: {
        paddingBottom: rem(2),
        alignSelf:"center",
        marginTop: rem(1.5),
    },
    confirmText: {
        backgroundColor: 'rgb(73,179,70)',
        paddingHorizontal: rem(3.5),
        paddingVertical: rem(0.5),
        color: '#1e1e1e',
        fontFamily: "Inter_800ExtraBold",
        fontSize: rem(1.5),
        letterSpacing: rem(0.03),
        borderRadius: 12
    },
});

export default ShiftAdminModal;