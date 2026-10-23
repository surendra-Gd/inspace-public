import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import { useFormik } from 'formik';
import {API} from "../../service/api/utils";
import {signupVerification} from "../../schemas/authSchemas";
import {rem} from "../../utils/uiUtils";
import ValidationError from "../../components/loader/ValidationError";
import Toast from "react-native-toast-message";
import {updateUserAction} from "../../service/actions/userActions";
import {useDispatch, useSelector} from "react-redux";
import ErrorComponent from "../../components/shared/ErrorComponent";

const ChangeEmailVerification = () => {
    const {userData:user} = useSelector(state => state.user);
    const dispatch = useDispatch();
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const [error, setError] = useState('');

    const updateUserEmail = async (value) => {
        const updatedUser = {...user, email: value};
        dispatch(updateUserAction(updatedUser))
    }

    const onSubmit = async (values, actions) => {
        if (!email) {
            setError('Page is expired. Try again later');
            return;
        }
        setError('');

        const request = {
            "token": values.code,
            "email": email
        }

        try {
            const res = await API.post("/users/change-email-verification", request);
            const result = res?.data;
            await updateUserEmail(result?.email);
            Toast.show({type: "success", text1: result?.message})

            router.back();
            actions.resetForm();
        } catch (error) {
            const response = error?.response?.data;
            if (response?.message === 'Email is already verified' && response?.status === 409) {
                router.back();
            } else if (response?.message === 'Validation failed') {
                const errMsg = response?.message[0] || "Validation failed! Please check your credentials";
                Toast.show({type: "error", text1: errMsg});
            } else {
                const errMsg = error?.response?.data?.message || "An unexpected error occurred. Please try again later.";
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
        handleSubmit,
    } = useFormik({
        initialValues: {
            code: "",
        },
        validationSchema: signupVerification,
        onSubmit,
    });

    return (
        <View style={styles.container}>

            <View style={styles.headingContainer}>
                <Text style={styles.heading}>Verify Your New Email Address</Text>
                <Text style={styles.context}>
                    A verification code has been sent to your email address.
                    Please enter the 7-digit verification code below to change your email address:
                </Text>
            </View>

            <View style={styles.inputForm}>
                <View style={styles.inputBox}>
                    <TextInput id="code"
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
                <TouchableOpacity style={styles.cancelButton}
                    onPress={() => router.replace("/changeemailvalidation")}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>

            {error && <ErrorComponent msg={error}/> }
        </View>
    );
};

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
        width: "98%",
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
    cancelButton: {
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
    }
});

export default ChangeEmailVerification;