import {View, Text, StyleSheet, TextInput, TouchableOpacity} from "react-native";
import {rem} from "../../utils/uiUtils";
import React from "react";
import {API} from "../../service/api/utils";
import {useFormik} from "formik";
import {statusSchema} from "../../schemas/authSchemas";
import {updateUserAction} from "../../service/actions/userActions";
import {useDispatch, useSelector} from "react-redux";
import ValidationError from "../../components/loader/ValidationError";
import Toast from "react-native-toast-message";


export default function ProfileBio() {
    const dispatch = useDispatch();
    const { userData: user } = useSelector((state) => state.user);
    const { status } = user;

    const onSubmit = async (values, actions) => {
        let status = values.status;
        status = status.replace(/\n{2,}/g, '\n').trim();
        try {
            await API.post("users/status", {status});
            const updatedUser = { ...user, status: values.status };
            await dispatch(updateUserAction(updatedUser));
            actions.resetForm();
        } catch (err) {
            const message = err?.response?.data?.message;
            Toast.show({type: "error", text1: message || "Unexpected error occurred."})
        }
    };

    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
    } = useFormik({
        initialValues: {
            status: status,
        },
        enableReinitialize: true,
        validationSchema: statusSchema,
        onSubmit,
    });

    return (
        <View style={styles.container}>
            <View style={styles.headingContainer}>
                <Text style={styles.heading}>Tell us about yourself!</Text>
                <Text style={styles.context}>
                    Share a little about who you are.
                    Your bio is visible to everyone, helping everyone connect and get to know you better
                </Text>
            </View>
            <View style={styles.inputContainer}>
                <TextInput id="status"
                    name="status"
                    style={styles.input}
                    onChangeText={handleChange("status")}
                    onBlur={handleBlur("status")}
                    value={values.status}
                    maxLength={100}
                    multiline
                    numberOfLines={5}
                    placeholderTextColor={"#fff"}
                />
                {errors.status && touched.status && (
                    <ValidationError errors={errors.status} />
                )}
            </View>
            <TouchableOpacity onPress={() => handleSubmit()}
                disabled={isSubmitting}
                style={[styles.buttonContainer, values.status===status && {opacity: 0.5}]}
            >
                <Text style={styles.buttonText}>{isSubmitting ? "Updating..." : "Update"}</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: rem(7.3),
        backgroundColor: "#000",
        flex: 1
    },
    headingContainer: {
        marginVertical: rem(1),
        paddingHorizontal: rem(1)
    },
    heading: {
        fontSize: rem(1.9),
        fontFamily: "Inter_700Bold",
        color: "rgba(221, 221, 221, 0.97)",
        padding: rem(0.5),
    },
    context: {
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: rem(0.5),
        letterSpacing: rem(0.03),
        color: "#6f6f6f"
    },
    inputContainer: {
        alignSelf: "center",
        width: "95%",
        height: rem(18),
        marginVertical: rem(1.5),
    },
    input: {
        paddingHorizontal: rem(1.5),
        backgroundColor: "#0e0e0e",
        width: "100%",
        textAlignVertical: "top",
        height: "100%",
        paddingVertical: rem(1),
        color: "#fff",
        fontSize: rem(1.6),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.09),
        borderRadius: 8,
        borderCurve: "continuous"
    },
    buttonContainer: {
        position: "absolute",
        bottom: rem(4),
        alignSelf: "center",
        width: "95%",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: rem(1),
        paddingHorizontal: rem(1),
        backgroundColor: "#fff",
        borderRadius: 10,
        borderCurve: "continuous"
    },
    buttonText: {
        color: "#000",
        fontSize: rem(1.7),
        fontFamily: "Inter_800ExtraBold",
        letterSpacing: rem(0.07)
    }
})