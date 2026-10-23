import React, {useState} from "react";
import {removeMemberAction} from "../../service/actions/spaceActions";
import {Modal, View, StyleSheet, Image, TouchableOpacity, Text, TextInput, ScrollView} from "react-native";
import {rem} from "../../utils/uiUtils";
import Toast from "react-native-toast-message";


const MemberRemovalModal = ({memberId, onClose, dispatch, isVisible}) => {
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);
    const feedbackRegex = /^[^<>]*.{1,200}$/;


    const handleSubmit = async () => {
        if(feedback.length < 10) {
            Toast.show({type: "error", text1: "Please enter at least 10 characters."})
        } else if(!feedbackRegex.test(feedback)) {
            Toast.show({type: "error", text1: "Your feedback contains invalid characters."});
        } else {
            setLoading(true)
            await dispatch(removeMemberAction(memberId, feedback, onClose));
            setLoading(false);
        }
    }


    return (
        <Modal visible={isVisible} transparent={true} onRequestClose={() => onClose()} animationType={"slide"}>
            <View style={styles.modal}>
                <View style={styles.modalContainer}>
                    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity onPress={() => onClose()}
                            style={styles.closeIcon}
                            pointerEvents="box-only"
                        >
                            <Image source={require("../../assets/images/cross (1).png")}
                                   style={styles.closeIconImage}
                            />
                        </TouchableOpacity>

                        <View style={styles.headingContainer}>
                            <Text style={styles.heading}>
                                Removing Member?
                            </Text>
                            <Text style={styles.context}>
                                Removing this member will revoke their access to the space. Their content will be hidden but not deleted.
                                They can rejoin the space later to restore their access.
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <TextInput style={styles.feedbackInput}
                                value={feedback}
                                onChangeText={setFeedback}
                                maxLength={200}
                                multiline
                                placeholder="Reason for removal"
                                placeholderTextColor={"#6f6f6f"}
                                editable={!loading}
                            />

                            <TouchableOpacity onPress={() => handleSubmit()}
                                style={styles.modalConfirm}
                                disabled={loading}
                            >
                                <Text style={styles.confirmText}>{loading ? "Removing": "Remove"}</Text>
                            </TouchableOpacity>

                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContainer: {
        width: '100%',
        height: '65%',
        backgroundColor: '#f0f0f0',
        borderTopStartRadius: 20,
        borderTopEndRadius: 20,
        padding: 10,
    },
    closeIcon: {
        position: "absolute",
        top: rem(0),
        right: rem(0),
        paddingHorizontal: rem(1),
        paddingVertical: rem(1),
        zIndex: 1000
    },
    closeIconImage: {
        width: 30,
        height: 30,
    },
    headingContainer: {
        marginVertical: rem(1),
        paddingHorizontal: rem(1)
    },
    heading: {
        fontSize: rem(2),
        fontFamily: "Inter_700Bold",
        color: "#000",
        padding: rem(0.5),
    },
    context: {
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: rem(0.5),
        letterSpacing: rem(0.03),
        color: "#007bff"
    },
    form: {
        marginBottom: rem(2),
        alignItems: "center"
    },
    feedbackInput: {
        marginVertical: rem(2.5),
        backgroundColor: "#1E1E1EFF",
        width: "98%",
        height: 150,
        alignSelf: "center",
        color: "#fff",
        fontSize: rem(1.5),
        fontFamily: "Inter_500Medium",
        paddingTop: rem(1),
        paddingBottom: rem(2),
        paddingHorizontal: rem(2),
        letterSpacing: rem(0.01),
        borderRadius: 16,
        textAlignVertical: "top"
    },
    modalConfirm: {
        backgroundColor: 'rgb(255,32,32)',
        width: "75%",
        alignItems: "center",
        justifyContent: "center",
        // paddingHorizontal: rem(3.5),
        paddingVertical: rem(1),
        alignSelf:"center",
        borderRadius: 12,
        marginTop: rem(1.5),
    },
    confirmText: {
        color: '#000',
        fontFamily: "Inter_800ExtraBold",
        fontSize: rem(1.6),
        letterSpacing: rem(0.03),
    },
})

export default MemberRemovalModal;