import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useFormik } from "formik";
import {API} from "../../service/api/utils";
import {useRouter} from "expo-router";
import {changePasswordSchema} from "../../schemas/authSchemas";
import {rem} from "../../utils/uiUtils";
import Toast from "react-native-toast-message";


function ChangePassword() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const onSubmit = async (values, actions) => {
        try {
            await API.put("users/change-password", values);
            actions.resetForm();
            Toast.show({type: "success", text1: "Password changed successfully"})
            router.back();
        } catch (err) {
            const { status, error, validationErrors, message } = err?.response?.data || {};
            if (status === 400 && error === "Validation failed") {
                Toast.show({type: "error", text1: validationErrors[0]})
            } else {
                Toast.show({type: "error", text1: message || "An unexpected error occurred."})
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
        handleSubmit,
    } = useFormik({
        initialValues: {
            currentPassword: "",
            newPassword: "",
            confirmationPassword: "",
        },
        validationSchema: changePasswordSchema,
        onSubmit,
    });

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Change Password</Text>

            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <TextInput id="currentPassword"
                        name="currentPassword"
                        secureTextEntry={!showPassword}
                        placeholder="Old password"
                        value={values.currentPassword}
                        onChangeText={handleChange("currentPassword")}
                        onBlur={handleBlur("currentPassword")}
                        style={styles.input}
                        autoCompleteType="off"
                    />
                    {errors.currentPassword && touched.currentPassword && (
                        <Text style={styles.errorText}>{errors.currentPassword}</Text>
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        id="newPassword"
                        name="newPassword"
                        secureTextEntry={!showPassword}
                        placeholder="New password"
                        value={values.newPassword}
                        onChangeText={handleChange("newPassword")}
                        onBlur={handleBlur("newPassword")}
                        style={styles.input}
                        autoCompleteType="off"
                    />
                    {errors.newPassword && touched.newPassword && (
                        <Text style={styles.errorText}>{errors.newPassword}</Text>
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        id="confirmationPassword"
                        name="confirmationPassword"
                        secureTextEntry={!showPassword}
                        placeholder="Confirm password"
                        value={values.confirmationPassword}
                        onChangeText={handleChange("confirmationPassword")}
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

                <TouchableOpacity onPress={handleSubmit}
                    style={styles.submitButton}
                    disabled={isSubmitting || values.confirmationPassword !== values.newPassword || !values.newPassword}
                >
                    <Text style={styles.submitButtonText}>
                        {isSubmitting ? "Loading..." : "Change"}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.suggestionSteps}>
                <Text style={styles.context}>If you do not remember your old password then:</Text>
                {["Logout", "Login with wrong credentials", "Forget password"].map((step, index) => (
                    <View key={index} style={styles.stepContainer}>
                        <Text style={styles.stepNumber}>{index + 1}.</Text>
                        <Text style={styles.steps}>{step}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        marginTop: rem(7.3),
        padding: rem(1),
    },
    heading: {
        fontSize: rem(2),
        fontFamily: "Inter_700Bold",
        left: rem(0.1),
        color: "#fff",
        padding: rem(1)
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
        marginTop: rem(1),
        paddingVertical: rem(1.2),
        alignItems: "center",
    },
    submitButtonText: {
        color: "#000",
        fontSize: rem(1.6),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.04)
    },
    suggestionSteps: {
        marginTop: rem(3),
        padding: rem(0.5),
        alignSelf: "center"
    },
    stepContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        alignSelf: "center",
    },
    context: {
        color: "#6f6f6f",
        alignSelf: "center",
        textAlign: "center",
        fontFamily: "Inter_600SemiBold",
        marginBottom: rem(2),
    },
    stepNumber: {
        fontSize: rem(1.3),
        fontFamily: "Inter_800ExtraBold",
        marginRight: 8,
        color: "#3083FFFF"
    },
    steps: {
        color: "#3083FFFF",
        fontFamily: "Inter_600SemiBold",
        fontSize: rem(1.3)
    }
});

export default ChangePassword;