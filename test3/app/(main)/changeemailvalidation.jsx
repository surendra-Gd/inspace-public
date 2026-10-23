import React, {useState} from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Pressable} from "react-native";
import { useFormik } from "formik";
import {API} from "../../service/api/utils";
import {passwordSchema} from "../../schemas/authSchemas";
import ChangeEmail from "../../components/settings/ChangeEmail";
import ErrorComponent from "../../components/shared/ErrorComponent";
import {rem} from "../../utils/uiUtils";
import {useFocusEffect} from "expo-router";


function ChangeEmailValidation() {
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const clearState = () => {
        setIsSuccess(false);
        setError("");
        setShowPassword(false);
    };

    const onSubmit = async (values, actions) => {
        clearState();

        const request = {
            "password": values.password
        }
        try {
            await API.post("users/validate-password", request);
            actions.resetForm();
            setIsSuccess(true);
        } catch (err) {
            const errMsg = err?.response?.data?.message || "Unexpected error occurred";
            setError(errMsg);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            clearState();
        }, [])
    );

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
            password: "",
        },
        validationSchema: passwordSchema,
        onSubmit,
    });

    if (isSuccess) return <ChangeEmail />;

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Enter your password</Text>

            <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                    <TextInput id="password"
                        name="password"
                        secureTextEntry={!showPassword}
                        placeholder="Password"
                        value={values.password}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                        required
                        autoComplete="off"
                        style={styles.input}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.toggleVisibility}
                    >
                        {showPassword ? (
                            <Image source={require("../../assets/images/view.png")} style={{width: 20, height: 20}} />
                        ) : (
                            <Image source={require("../../assets/images/hidden.png")} style={{width: 20, height: 20}} />
                        )}
                    </TouchableOpacity>
                </View>

                {errors.password && touched.password && (
                    <Text style={styles.error}>
                        {errors.password}
                    </Text>
                )}
            </View>

            <View style={styles.submit}>
                <Pressable style={styles.submitButton}
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                >
                    <Text style={styles.submitText}>{isSubmitting ? "Verifying" : "Verify"}</Text>
                </Pressable>
            </View>

            {error && <ErrorComponent msg={error} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        flex: 1,
        paddingVertical: rem(1),
        height: "100%"
    },
    heading: {
        marginTop: rem(6),
        paddingVertical: rem(1),
        paddingHorizontal: rem(2),
        fontSize: rem(2),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.025),
        textAlign: "left",
        color: "#fff"
    },
    inputGroup: {
        marginTop: rem(3),
        paddingVertical: rem(1),
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: rem(2),
        position: "relative",
    },
    input: {
        width: "100%",
        borderRadius: 10,
        flex: 1,
        height: 45,
        paddingHorizontal: 20,
        fontSize: rem(1.6),
        fontFamily: "Inter_700Bold",
        color: "#000",
        backgroundColor: "#fff"
    },
    toggleVisibility: {
        padding: 10,
    },
    error: {
        color: "red",
        marginTop: 6,
        left: "5%",
        paddingRight: 10,
        fontSize: rem(1.3),
        fontFamily: "Inter_500Medium"
    },
    submit: {
        position: "absolute",
        bottom: rem(6),
        width: "90%",
        alignSelf: "center",
        marginHorizontal: rem(1),
    },
    submitButton: {
        backgroundColor: "#3083FFFF",
        paddingVertical: rem(0.9),
        paddingHorizontal: rem(3),
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10
    },
    submitText: {
        color: "#000",
        fontSize: rem(1.7),
        fontFamily: "Inter_800ExtraBold",
        letterSpacing: rem(0.05)
    }

});

export default ChangeEmailValidation;