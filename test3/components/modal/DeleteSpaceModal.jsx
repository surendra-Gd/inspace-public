import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image, Modal} from 'react-native';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import {deleteSpaceAction} from "../../service/actions/userActions";
import {rem} from "../../utils/uiUtils";


const DeleteSpaceModal = ({ isVisible, onClose, spaceId }) => {
    const dispatch = useDispatch();
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);
    const feedbackRegex = /^[^<>]*.{1,200}$/;

    const handleSubmit = async () => {
        if (feedback.length < 10) {
            Toast.show({ type: 'error', text1: 'Please enter at least 10 characters' });
        } else if (!feedbackRegex.test(feedback)) {
            Toast.show({ type: 'error', text1: 'Your feedback contains invalid characters' });
        } else {
            setLoading(true);
            await dispatch(deleteSpaceAction(feedback, spaceId, onClose));
            setLoading(false);
        }
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
                            Are you sure you want to delete this space?
                        </Text>
                        <TextInput style={styles.feedbackInput}
                            value={feedback}
                            onChangeText={setFeedback}
                            maxLength={200}
                            multiline
                            placeholder="Reason for removal"
                            placeholderTextColor={"#6f6f6f"}
                            editable={!loading}
                        />

                    </View>
                    <TouchableOpacity style={styles.modalConfirm}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Text style={styles.confirmText}>Delete</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        width: "98%",
        alignSelf: "center",
    },
    modalCard: {
        marginHorizontal: rem(1),
        position: "absolute",
        alignContent: "center",
        backgroundColor: "rgba(243,243,243,0.99)",
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
        paddingHorizontal: rem(2),
    },
    modalText: {
        paddingHorizontal: rem(1),
        fontSize: rem(1.6),
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
    feedbackInput: {
        position: "relative",
        minWidth: "100%",
        marginVertical: rem(0.5),
        backgroundColor: "#1E1E1EFF",
        height: 100,
        alignSelf: "center",
        color: "#fff",
        fontSize: rem(1.5),
        fontFamily: "Inter_500Medium",
        paddingTop: rem(1),
        paddingBottom: rem(1),
        paddingHorizontal: rem(1.3),
        letterSpacing: rem(0.01),
        textAlignVertical: "top"
    },
});

export default DeleteSpaceModal;
