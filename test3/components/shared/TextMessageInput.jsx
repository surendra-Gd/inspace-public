import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
    StyleSheet,
    Image,
} from "react-native";
import {MESSAGE, REPLY} from "../../service/constants/spaceConstants";
import {SEND_MESSAGE} from "../../service/constants/stompConstants";
import {useFormik} from "formik";
import React, {useEffect, useRef} from "react";
import {textMessageSchema} from "../../schemas/authSchemas";
import Toast from "react-native-toast-message";

export const TextMessageInput = (
    {prefix, textId, memberId, dispatch, handleUserTextAction, keyBoardIsActive, setPrefix}
) => {
    const inputRef = useRef(null);

    const onSubmit = async (values, actions) => {
        const channel = "tm.addTextMessage";
        const message = {
            message: values?.message,
            type: prefix ? REPLY : MESSAGE,
            prefixes: prefix ? prefix : null,
            textId: textId,
            memberId: memberId
        };
        dispatch({type: SEND_MESSAGE, payload: {channel, message}});
        handleUserTextAction();
        actions.resetForm();
    };

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
    } = useFormik({
        initialValues: {
            message: ""
        },
        enableReinitialize: true,
        validationSchema: textMessageSchema,
        onSubmit,
    });

    useEffect(() => {
        if (errors.message && touched.message) {
            const errMsg = errors.message;
            Toast.show({type: "error", text1: errMsg})
        }
    }, [errors, touched]);

    useEffect(() => {
        if (prefix && inputRef.current && !keyBoardIsActive) {
            inputRef.current.blur();
            setTimeout(() => {
                inputRef.current.focus();
            }, 50);
        }
    }, [prefix]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.container}
        >
            {prefix ? (
                <View style={styles.replyContainer}>
                    <Pressable
                        onPress={() => setPrefix("")}
                        style={({ pressed }) => [
                            styles.cancelBtn,
                            pressed && { opacity: 0.6 }, // Feedback on press
                        ]}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <Image source={require("../../assets/images/remove.png")} style={styles.cancelIcon} />
                    </Pressable>
                    <Text style={styles.reply} numberOfLines={4}>{prefix}</Text>
                </View>
            ) : null}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Type your message..."
                    value={values.message}
                    onChangeText={handleChange("message")}
                    multiline
                    placeholderTextColor="#000"
                    ref={inputRef}
                />
                <Pressable style={styles.sendButton} onPress={handleSubmit}>
                    <Image source={require("../../assets/images/send (1).png")} style={{width: 21, height: 21}} />
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        paddingTop: 10,
        paddingHorizontal: 10,
        bottom: 10,
        flexDirection: "column",
        alignItems: "flex-start",
        paddingBottom: Platform.OS === "ios" ? 20 : 5,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    textInput: {
        maxHeight: 100,
        backgroundColor: "#fff",
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
        fontSize: 14,
        color: "#333",
        fontFamily: "Inter_600SemiBold"
    },
    sendButton: {
        backgroundColor: "#3e9bff",
        padding: 10,
        borderRadius: 50,
        right: 5,
        marginLeft: 17,
    },
    replyContainer: {
        backgroundColor: "#dfdfdf",
        maxHeight: 100,
        width: "70%",
        borderRadius: 10,
        paddingLeft: 10,
        paddingHorizontal: 6,
        paddingVertical: 8,
        flexDirection: "column",
        marginBottom: 5,
        marginLeft: 5,
        pointerEvents: "auto"
    },
    reply: {
        color: "#000000",
        fontSize: 14,
        fontFamily: "Inter_500Medium"
    },
    cancelBtn: {
        alignSelf: "flex-end",
        position: "absolute",
        top: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
        width: 30,
        height: 30,
        zIndex: 1
    },
    cancelIcon: {
        width: 20,
        height: 20
    },
})