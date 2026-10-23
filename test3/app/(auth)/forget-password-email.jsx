import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useFormik } from "formik";
import {API} from "../../service/api/utils";
import {useRouter} from "expo-router";
import {emailSchema} from "../../schemas/authSchemas";
import ValidationError from "../../components/loader/ValidationError";
import {rem} from "../../utils/uiUtils";


function ForgetPasswordEmail() {
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const onSubmit = async (values, action) => {
        setError("");
        setMessage("");

        try {
            const response = await API.post(`auth/forget-password-email?email=${values.email}`);
            const data = response?.data;

            if (data?.status === 202 && data?.code === "Account Activation") {
                action.resetForm();
                router.replace({
                    pathname: "/signup-verification",
                    params: { email: values.email }
                });
            }

            if (data.status === 200 && data?.code === "Reset Password") {
                action.resetForm();
                router.replace({
                    pathname: "/forget-password-verification",
                    params: { email: values.email }
                });
            }

        } catch (error) {
            if (error?.response?.status === 500) {
                setError("Something went wrong. Please try again later");
            } else {
                const errMsg = error?.response?.data?.message || "Unexpected error occurred";
                setError(errMsg);
            }
        }
    };

    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit
    } = useFormik({
        initialValues: {
            email: ""
        },
        validationSchema: emailSchema,
        onSubmit
    });

    return (
        <View style={styles.container}>
            <View style={styles.inputForm}>
                <Text style={styles.header}>
                    Enter the email you used for your account.
                </Text>
                <View style={styles.inputBox}>
                <TextInput id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="example@email.com"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    autoComplete="off"
                    style={styles.input}
                    placeholderTextColor={"#1e1e1e"}
                />

                {errors.email && touched.email && (
                    <ValidationError errors={errors.email} />
                )}
            </View>
            </View>


            <TouchableOpacity onPress={() => handleSubmit()}
                disabled={!values.email || isSubmitting}
                style={styles.buttonContainer}
            >
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Verification Code</Text>}
            </TouchableOpacity>


            <View style={styles.messageContainer}>
                {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
                {message ? <Text style={styles.successMessage}>{message}</Text> : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        paddingVertical: rem(1),
        paddingHorizontal: rem(2),
        marginTop: rem(7),
        height: "100%"
    },
    inputForm: {
        width: "100%",
        flexDirection: "column",
        gap: rem(2)
    },
    header: {
        fontSize: rem(1.9),
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: rem(0.7),
        color: "#635f5f"
    },
    inputBox: {
        position: "relative",
    },
    input: {
        width: "100%",
        paddingHorizontal: rem(2),
        paddingVertical: rem(0.7),
        fontSize: rem(1.5),
        letterSpacing: rem(0.05),
        fontFamily: "Inter_600SemiBold",
        color: "#000",
        backgroundColor: "#d9d9d9",
        borderRadius: 10,
        borderCurve: "circular"
    },
    buttonContainer: {
        position: "absolute",
        bottom: rem(15),
        justifyContent: "center",
        width: "96%",
        alignSelf: "center",
        paddingHorizontal: rem(5),
        paddingVertical: rem(1.1),
        backgroundColor: "#3083FF",
        borderRadius: 25,
        alignItems: "center"
    },
    buttonText: {
        color: "#000",
        textAlign: "center",
        fontSize: rem(1.5),
        letterSpacing: rem(0.05),
        fontFamily: "Inter_800ExtraBold"
    },
    messageContainer: {
        marginTop: rem(7),
        minHeight: rem(5),
        width: "100%",
        borderRadius: 5
    },
    errorMessage: {
        borderWidth: 2,
        borderColor: "rgba(255, 0, 0, 0.52)",
        borderRadius: 5,
        textAlign: "center",
        padding: rem(1.5),
        backgroundColor: "rgba(120, 52, 52, 0.78)",
        color: "#ff0000",
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold"
    },
    successMessage: {
        borderWidth: 2,
        borderColor: "rgba(26, 255, 0, 0.52)",
        borderRadius: 5,
        textAlign: "center",
        padding: rem(1.5),
        backgroundColor: "rgba(93, 120, 52, 0.78)",
        color: "#40ff00",
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold"
    }
});

export default ForgetPasswordEmail;