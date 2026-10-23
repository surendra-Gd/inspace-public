import React, {useState} from "react";
import {useFormik} from "formik";
import {resetPasswordSchema} from "../../schemas/authSchemas";
import {API} from "../../service/api/utils";
import {useRouter} from "expo-router";
import Toast from "react-native-toast-message";
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {rem} from "../../utils/uiUtils";


function ResetPassword({username, email, token, previous}) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");


    const onSubmit = async (values, actions) => {
        if(!email || !token) {
            setError("Page is Expired or Something went wrong Please try again.");
            return;
        }
        setError("");
        setShowPassword(false);
        const { password, confirmationPassword } = values;
        const request = {
            code: token,
            email: email,
            password: password,
            confirmPassword: confirmationPassword,
        };

        try {
            const res = await API.post("/auth/reset-password", request);
            actions.resetForm();
            Toast.show({type: "success", text1: res?.data});
            router.back();
        } catch (err) {
            const res = err?.response?.data;
            if (res?.error === "Validation failed" && res?.status === 400) {
                setError(res?.validationErrors[0]);
            } else if (res?.error === "Invalid Credentials" && res?.status === 400) {
                actions.resetForm();
                previous();
            } else {
                setError("unexpected error occurred. Please try again later.");
            }
        }
    };

    const handleTrimChange = (e) => {
        const { name, value } = e.target;
        const trimmedValue = value.trim();
        handleChange({
            target: { name, value: trimmedValue },
        });
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
            password: "",
            confirmationPassword: ""
        },
        validationSchema: resetPasswordSchema,
        onSubmit
    })


    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.heading}>Reset your password</Text>
                <Text style={styles.subHeading}>
                    We found an account with the username <Text style={styles.username}>{username}</Text> linked to this email. If this isn't correct, please double-check and try again
                </Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        id="password"
                        name="password"
                        secureTextEntry={!showPassword}
                        placeholder="New password"
                        value={values.password}
                        onChangeText={(value) => handleTrimChange({ target: { name: "password", value } })}
                        onBlur={handleBlur("password")}
                        style={styles.input}
                        autoCompleteType="off"
                    />
                    {errors.password && touched.password && (
                        <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        id="confirmationPassword"
                        name="confirmationPassword"
                        secureTextEntry={!showPassword}
                        placeholder="Confirm password"
                        value={values.confirmationPassword}
                        onChangeText={(value) => handleTrimChange({ target: { name: "confirmationPassword", value } })}
                        onBlur={handleBlur("confirmationPassword")}
                        style={styles.input}
                        autoCompleteType="off"
                    />
                    {errors.confirmationPassword && touched.confirmationPassword && (
                        <Text style={styles.errorText}>{errors.confirmationPassword}</Text>
                    )}
                </View>

                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.toggleVisibility}>
                    <Text style={styles.toggleLabel}>
                        {showPassword ? "Hide Password" : "Show Password"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleSubmit()}
                    style={styles.submitButton}
                    disabled={isSubmitting || values.confirmationPassword !== values.password || !values.password}
                >
                    <Text style={styles.submitButtonText}>
                        {isSubmitting ? "Changing..." : "Change"}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>


            {error && <Text style={styles.errorMessage}>{error}</Text>}

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: rem(4),
        padding: rem(1),
    },
    heading: {
        fontSize: rem(2),
        fontFamily: "Inter_700Bold",
        left: rem(0.1),
        color: "#fff",
        padding: rem(1)
    },
    subHeading: {
        marginTop: rem(1),
        fontSize: rem(1.3),
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: rem(0.5),
        letterSpacing: rem(0.03),
        color: "#d9d9d9",
        marginBottom: rem(3.5),
    },
    formContainer: {
        paddingTop: rem(1.5),
        padding: rem(0.5),
    },
    inputContainer: {
        marginVertical: rem(1)
    },
    input: {
        width: "100%",
        height: 50,
        color: "#fff",
        backgroundColor: "#1E1E1EFF",
        fontSize: rem(1.6),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.04),
        borderRadius: 7,
        paddingHorizontal: rem(2),
        marginBottom: 8,
    },
    errorText: {
        color: "red",
        marginBottom: 8,
    },
    toggleVisibility: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    toggleLabel: {
        fontSize: rem(1.3),
        fontFamily: "Inter_800ExtraBold",
        marginLeft: 8,
        color: "#007BFF",
        letterSpacing: rem(0.02)
    },
    submitButton: {
        backgroundColor: "#fff",
        borderRadius: 25,
        marginTop: rem(15),
        paddingVertical: rem(1.2),
        alignItems: "center",
    },
    submitButtonText: {
        color: "#000",
        fontSize: rem(1.6),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.04)
    },
    cancelButton: {
        marginTop: rem(1),
        backgroundColor: "#000",
        alignItems: "center",
        width: "100%",
        height: rem(4.5),
        justifyContent: "center",

    },
    cancelButtonText: {
        color: "#e74c3c",
        fontFamily: "Inter_800ExtraBold",
        fontSize: rem(1.5),
        letterSpacing: rem(0.07)
    },
    username: {
        color: "rgb(255,32,32)",
        fontSize: 17,
        fontFamily: "Inter_600SemiBold"
    }
});

export default ResetPassword;