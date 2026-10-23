import React, { useState } from "react";
import {View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Image} from "react-native";
import { removePostAction } from "../../service/actions/spaceActions";
import {rem} from "../../utils/uiUtils";
import Toast from "react-native-toast-message";


const DeletePostModal = ({ isVisible, post, router, onClose, dispatch }) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await dispatch(removePostAction(post?.memberId, post));
            if (router) {
                router.back();
            }
            onClose();
        } catch (error) {
            Toast.show({type: "error", text1: "Failed to delete the post, try again later."});
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={isVisible} transparent={true} onRequestClose={() => onClose()} animationType="fade">
            <View style={styles.modal}>
                <View style={styles.modalCard}>
                    <TouchableOpacity style={styles.modalClose} onPress={onClose}>
                        <Image source={require("../../assets/images/wrong.png")} style={{width:30, height:30}}/>
                    </TouchableOpacity>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>
                            Are you sure you want to delete this post?
                        </Text>
                        <Text style={styles.modalInfo}>This action cannot be undone.</Text>
                    </View>
                    <TouchableOpacity style={styles.modalConfirm}
                        onPress={handleDelete}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Text style={styles.confirmText}>Yes, delete this post</Text>
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
        marginHorizontal: rem(1),
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

export default DeletePostModal;