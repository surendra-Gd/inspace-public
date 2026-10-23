import {useEffect, useRef} from "react";
import {COMMENT, REPLY} from "../../service/constants/spaceConstants";
import {SEND_MESSAGE} from "../../service/constants/stompConstants";
import {useFormik} from "formik";
import {Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import Toast from "react-native-toast-message";
import {commentSchema, replySchema} from "../../schemas/authSchemas";


export const PostCommentInput = (
    {postId, prefix, parentId, memberId, dispatch, setPrefix, active, setActive}
) => {
    const inputRef = useRef(null);

    const onSubmit = async (values, actions) => {
        const messageText = prefix ? values.payload.replace(`@${prefix} `, '') : values.payload;

        if(messageText === "" || messageText.length > 720) {
            Toast.show({type: "error", text1: "Reply is too short. At least maintain 1 character."});
            return;
        }

        const channel = "post.addComment";
        const message = {
            payload: messageText,
            commentType: parentId ? REPLY : COMMENT,
            prefix: prefix ? prefix : null,
            postId: postId,
            memberId: memberId,
            parentId: parentId ? parentId : null
        };
        dispatch({type: SEND_MESSAGE, payload: {channel, message}});
        if (prefix) setPrefix("");
        if(active) setActive(false)
        actions.resetForm();
    };

    const handleMessageChange = (value) => {
        const trimmedValue = value.trim();
        if (prefix && !trimmedValue.startsWith(`@${prefix} `)) {
            setPrefix("");
            value = "";
        }
        handleChange({target: {name: "payload", value: value}});
    };

    const {
        values,
        errors,
        touched,
        handleChange,
        handleSubmit,
    } = useFormik({
        initialValues: {
            payload: prefix ? `@${prefix} ` : ""
        },
        enableReinitialize: true,
        validationSchema: parentId ? replySchema : commentSchema,
        onSubmit,
    });


    useEffect(() => {
        if (errors.payload && touched.payload) {
            const errMsg = errors.payload;
            Toast.show({type: "error", text1: errMsg})
        }
    }, [errors, touched]);


    useEffect(() => {
        if ((prefix && inputRef.current) || active) {
            inputRef.current.blur();
            setTimeout(() => {
                inputRef.current.focus();
            }, 50);
        }
    }, [prefix, active]);


    useEffect(() => {
        const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
            if (active) {
                setActive(false);
            }
        });

        return () => {
            keyboardHideListener.remove();
        };
    }, []);


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.container}
        >
            <View style={[styles.inputContainer, {paddingTop: active ? 10 : 0}]}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Share your thought 💭"
                    value={values.payload}
                    onChangeText={(value) => handleMessageChange(value)}
                    multiline={!active}
                    placeholderTextColor="#fff"
                    ref={inputRef}
                    returnKeyType={"send"}
                    onSubmitEditing={handleSubmit}
                />
                {!active && (
                    <Pressable style={styles.sendButton} onPress={handleSubmit}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </Pressable>
                )}
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        paddingHorizontal: 15,
        flexDirection: "column",
        alignItems: "flex-start",
        paddingBottom: Platform.OS === "ios" ? 20 : 8
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        alignSelf: "center",
        borderBottomWidth: 2,
        borderBottomColor: "#6f6f6f",
        paddingBottom: 1
    },
    textInput: {
        maxHeight: 80,
        flex: 1,
        paddingHorizontal: 10,
        fontSize: 14,
        color: "#fff",
        fontFamily: "Inter_500Medium"
    },
    sendButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 50,
        right: 5,
        marginLeft: 10,
    },
    sendButtonText: {
        fontFamily: "Inter_800ExtraBold",
        color: "#3e9bff",
        fontSize: 15,
        letterSpacing: 0.1
    }
})