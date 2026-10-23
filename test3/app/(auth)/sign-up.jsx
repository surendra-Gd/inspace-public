import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from "react-native";
import { useFormik } from "formik";
import {useRouter} from "expo-router";
import {API} from "../../service/api/utils";
import {emailSchema} from "../../schemas/authSchemas";
import ErrorComponent from "../../components/shared/ErrorComponent";
import SignUpProfile from "../../components/auth/SignUpProfile";
import {rem} from "../../utils/uiUtils";
import ValidationError from "../../components/loader/ValidationError";


export default function SignUpEmail() {
    const [error, setError] = useState("");
    const [isEmailAvailable, setIsEmailAvailable] = useState(false);
    const router = useRouter();

    const clearState = () => {
        setError("");
        setIsEmailAvailable(false);
    };

    const onSubmit = async (values) => {
        clearState();
        try {
            const res = await API.get(`/auth/check-email-availability?email=${values.email}`);
            if (res.status === 200) {
                setIsEmailAvailable(true);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Unexpected error occurred";
            setError(errorMessage);
        }
    };

    const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = useFormik({
        initialValues: { email: "" },
        validationSchema: emailSchema,
        onSubmit,
    });

    if (isEmailAvailable) {
        return (
            <SignUpProfile email={values.email}
                onBack={() => setIsEmailAvailable(false)}
            />
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.heading}>Enter your email</Text>
                <TextInput id="email"
                    name="email"
                    keyboardType="email-address"
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

            <TouchableOpacity disabled={isSubmitting}
                onPress={() => handleSubmit()}
                style={styles.button}
            >
                {isSubmitting ? <ActivityIndicator color="#000" /> : (
                    <>
                        <Text style={styles.buttonText}>Next</Text>
                        <Image source={require("../../assets/images/right-arrow.png")} style={{width: 22, height: 22}} />
                    </>
                )}
            </TouchableOpacity>

            {error && <ErrorComponent msg={error} />}

            <TouchableOpacity onPress={() => router.replace("/login")}
                style={styles.linkContainer}>
                <Text style={styles.linkText}>Back to</Text>
                <Text style={styles.link}>Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        flex: 1,
    },
    form: {
        padding: rem(0.7)
    },
    heading: {
        marginTop: rem(7),
        color: "rgba(221, 221, 221, 0.97)",
        fontSize: rem(2.2),
        paddingLeft: rem(1),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.07),
    },
    input: {
        marginTop: rem(2),
        width: "100%",
        height: rem(5.2),
        borderWidth: 1,
        borderColor: "#1e1e1e",
        paddingHorizontal: rem(2),
        borderRadius: 10,
        color: "#d9d9d9",
        fontSize: rem(1.7),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.04)
    },
    button: {
        position: "absolute",
        bottom: rem(12),
        alignSelf: "center",
        width: "90%",
        justifyContent: "center",
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        gap: rem(1.5),
        borderRadius: 10,
        borderCurve: "continuous",
        minHeight: rem(4.6),
    },
    buttonText: {
        letterSpacing: rem(0.05),
        textAlignVertical: "center",
        color: "#000",
        fontSize: rem(1.7),
        fontFamily: "Inter_700Bold",
    },
    linkContainer: {
        position: "absolute",
        bottom: rem(7),
        alignSelf: "center",
        flexDirection: "row",
        gap: rem(0.5),
        alignItems: "flex-end",
        justifyContent: "center"
    },
    linkText: {
        color: "#fff",
        fontSize: rem(1.4),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.03)
    },
    link: {
        color: "#3083FF",
        fontSize: rem(1.5),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.03)
    },
});