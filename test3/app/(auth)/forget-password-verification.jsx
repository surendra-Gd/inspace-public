import React, {useState} from "react";
import Toast from "react-native-toast-message";
import {useLocalSearchParams} from "expo-router";
import {useFormik} from "formik";
import {signupVerification} from "../../schemas/authSchemas";
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import ValidationError from "../../components/loader/ValidationError";
import {rem} from "../../utils/uiUtils";
import {API} from "../../service/api/utils";
import ResetPassword from "../../components/auth/ResetPassword";

function ForgetPasswordVerification() {
    const { email } = useLocalSearchParams();
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");


    const onSubmit = async (values) => {
        if (!email) {
            setError('Page is expired. Try again later');
            return;
        }

        setError('');
        setSuccess(false);

        const request = {
            "token": values.code,
            "email": email
        }

        try {
            const {data} = await API.post("auth/forget-password-verification", request);
            if(data?.status === 200) {
                setUsername(data?.payload);
                setSuccess(true)
                const resMsg = data?.message || "Code is verified successfully! You can now reset your password.";
                Toast.show({type: "success", text1: resMsg});
            } else {
                Toast.show({type: "error", text1: "Something went wrong please try again later."});
            }
        } catch (error) {
            const errMsg = error?.response?.data?.message || "An unexpected error occurred. Please try again later.";
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
            code: "",
        },
        validationSchema: signupVerification,
        onSubmit,
    });




    if (success && values.code) {
        return (
            <ResetPassword
                username={username}
                email={email}
                token={values.code}
                previous={() => setSuccess(false)}
            />
        )
    }

    return (
        <View style={styles.container}>

            <View style={styles.headingContainer}>
                <Text style={styles.heading}>Password Reset Verification.</Text>
                <Text style={styles.context}>
                    A verification code has been sent to your email address.
                    Please enter the 7-digit verification code below to reset your password:
                </Text>
            </View>

            <View style={styles.inputForm}>
                <View style={styles.inputBox}>
                    <TextInput
                        id="code"
                        name="code"
                        style={styles.input}
                        placeholder="Enter your 7 digit code."
                        value={values.code}
                        onChangeText={handleChange('code')}
                        onBlur={handleBlur('code')}
                        maxLength={7}
                        keyboardType="numeric"
                        autoCompleteType="off"
                        placeholderTextColor={"#000"}
                        accessibilityLabel="Verification Code"
                    />
                    {errors.code && touched.code && (
                        <ValidationError errors={errors.code} />
                    )}
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.submitButton}
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                >
                    <Text style={styles.submitButtonText}>
                        {isSubmitting ? 'Verifying...' : 'Verify'}
                    </Text>
                </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorMessage}>{error}</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        height: "100%"
    },
    headingContainer: {
        marginTop: rem(7),
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
    inputForm: {
        marginTop: rem(5),
        justifyContent: "center",
        gap: rem(5)
    },
    inputBox: {
        alignSelf: "center",
        width: "94%",
        height: rem(4.8),
    },
    input: {
        backgroundColor: "#6f6f6f",
        fontSize: rem(1.7),
        fontFamily: "Inter_800ExtraBold",
        borderRadius: 10,
        borderCurve: "circular",
        color: "#000",
        position: "relative",
        width: "100%",
        height: "100%",
        paddingHorizontal: rem(2),
        paddingVertical: rem(1)
    },
    buttonContainer: {
        position: "absolute",
        bottom: rem(6),
        width: "80%",
        alignSelf: "center",
        flexDirection: 'column',
        alignItems: "center",
        gap: rem(2.5),
    },
    submitButton: {
        width: "100%",
        backgroundColor: "#fff",
        height: rem(4.5),
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        borderCurve: "circular"
    },
    submitButtonText: {
        color: "#000",
        fontSize: rem(1.6),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.03)
    },
    errorMessage: {
        borderWidth: 2,
        borderColor: "rgba(255, 0, 0, 0.52)",
        borderRadius: 5,
        textAlign: "center",
        paddingVertical: rem(1.5),
        paddingHorizontal: rem(1),
        backgroundColor: "rgba(120, 52, 52, 0.78)",
        color: "#ff0000",
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold",
        marginTop: rem(10),
        marginHorizontal: 10
    },
});

export default ForgetPasswordVerification;