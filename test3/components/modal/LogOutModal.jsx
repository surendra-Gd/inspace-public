import React, { useState } from "react";
import {View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Image} from "react-native";
import {useDispatch} from "react-redux";
import { logoutAction } from "../../service/actions/authActions";
import {rem} from "../../utils/uiUtils";

const LogOutModal = ({ isVisible, onClose }) => {
    const [loggingOut, setLoggingOut] = useState(false);
    const dispatch = useDispatch();

    const handleLogout = async () => {
        setLoggingOut(true);
        await dispatch(logoutAction(dispatch));
        onClose();
        setLoggingOut(false);
    };


    return (
        <Modal visible={isVisible} transparent={true} onRequestClose={() => onClose()} animationType="slide">
            <View style={styles.modal}>
                <View style={styles.modalCard}>
                    <TouchableOpacity style={styles.modalClose} onPress={onClose}>
                        <Image source={require("../../assets/images/wrong.png")} style={{width:30, height:30}}/>
                    </TouchableOpacity>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>
                            Are you sure you want to log out of this account?
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.modalConfirm}
                        onPress={handleLogout}
                        disabled={loggingOut}
                    >
                        {loggingOut ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.confirmText}>Log out</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

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
        marginHorizontal: rem(2),
        top: "30%",
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
    username: {
        fontSize: rem(1.6),
        fontFamily: "Inter_700Bold",
    },
    modalConfirm: {
        paddingBottom: rem(2),
        alignSelf:"center",
        marginTop: rem(1.5),
    },
    confirmText: {
        backgroundColor: 'rgb(255,32,32)',
        paddingHorizontal: rem(3.5),
        paddingVertical: rem(0.5),
        color: '#f0f0f0',
        fontFamily: "Inter_800ExtraBold",
        fontSize: rem(1.6),
        letterSpacing: rem(0.03),
        borderRadius: 12
    },
});

export default LogOutModal;
