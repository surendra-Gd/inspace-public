import React, {useState} from "react";
import {View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator} from "react-native";
import { API } from "../../service/api/utils";
import { useFormik } from "formik";
import { emailSchema } from "../../schemas/authSchemas";
import ErrorComponent from "../shared/ErrorComponent";
import {rem} from "../../utils/uiUtils";
import ValidationError from "../loader/ValidationError";
import {useRouter} from "expo-router";
import Toast from "react-native-toast-message";

const ChangeEmail = () => {
    const router = useRouter();
    const [error, setError] = useState("");

    const onSubmit = async (values) => {
        setError("");
        try {
            const res = await API.put(`users/change-email?email=${values.email}`);
            Toast.show({type: "success", text1: res?.data});
            router.push({
                pathname: "/change-email-verification",
                params: { email: values.email }
            });
        } catch (err) {
            const errMsg = err?.response?.data?.message || "Unexpected error occurred. Please try again later.";
            setError(errMsg);
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
            email: "",
        },
        validationSchema: emailSchema,
        onSubmit,
    });

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Add New Email</Text>

            <View style={styles.inputGroup}>
                <TextInput style={styles.input}
                    id="email"
                    name="email"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    keyboardType="email-address"
                    autoCompleteType="off"
                    placeholder="Email Address"
                    required
                    placeholderTextColor={"#d9d9d9"}
                />
                {errors.email && touched.email && (
                    <ValidationError errors={errors.email} />
                )}
            </View>
            <View style={styles.submit}>
                <View style={styles.submit}>
                    <Pressable style={styles.submitButton}
                        onPress={() => handleSubmit()}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitText}>
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color={"#000"} />
                            ) : (
                                "Send Verification Code"
                            )}
                        </Text>
                    </Pressable>
                </View>
            </View>

            {error && <ErrorComponent msg={error} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        flex: 1,
        paddingVertical: rem(1),
        height: "100%",
    },
    heading: {
        marginTop: rem(6),
        marginBottom: rem(2),
        paddingVertical: rem(1),
        paddingHorizontal: rem(2),
        fontSize: rem(2),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.025),
        textAlign: "left",
        color: "#fff"
    },
    inputGroup: {
        marginHorizontal: rem(1)
    },
    input: {
        width:"100%",
        height: 55,
        backgroundColor: "#1e1e1e",
        letterSpacing: rem(0.05),
        color: "#fff",
        borderWidth: 1,
        fontSize: rem(1.6),
        fontFamily: "Inter_600SemiBold",
        borderRadius: 10,
        paddingHorizontal: rem(2),
    },
    submit: {
        position: "absolute",
        bottom: rem(4),
        width: "92%",
        alignSelf: "center",
        marginHorizontal: rem(1.5),
    },
    submitButton: {
        backgroundColor: "#fff",
        paddingVertical: rem(1),
        paddingHorizontal: rem(3),
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 25
    },
    submitText: {
        color: "#000",
        fontSize: rem(1.7),
        fontFamily: "Inter_800ExtraBold",
        letterSpacing: rem(0.05)
    },
    messageContainer: {
        marginTop: 20,
    },
    successMessage: {
        color: "green",
        textAlign: "center",
    },
});

export default ChangeEmail;