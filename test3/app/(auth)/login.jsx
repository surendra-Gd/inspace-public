import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import Toast from 'react-native-toast-message';
import {signInSchema} from "../../schemas/authSchemas";
import {clearMessage, signInAction} from "../../service/actions/authActions";
import {useRouter} from "expo-router";
import {rem} from "../../utils/uiUtils";
import ValidationError from "../../components/loader/ValidationError";

export default function Login() {
    const dispatch = useDispatch();
    const router = useRouter();

    const { signInError, signInSuccess } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);


    const onSubmit = async (values, actions) => {
        await dispatch(clearMessage());
        try {
            await dispatch(signInAction(values, router));
            if (signInSuccess) {
                actions.resetForm();
            }
        } catch (err) {
            const errMsg = err?.response?.data || 'Unexpected error occurred';
            Toast.show({ type: 'error', text1: errMsg });
        }
    };

    const handleUsernameChange = (name, value) => {
        handleChange({ target: { name, value: value.trim().toLowerCase() } });
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
            username: "",
            password: ""
        },
        validationSchema: signInSchema,
        onSubmit,
    });


    return (
        <View style={styles.section}>

            {signInError && (
                <View style={styles.forgetPasswordLink}>
                    <Text style={styles.forgetPasswordMsg}>
                        {signInError}
                    </Text>
                    <TouchableOpacity onPress={() => {
                        dispatch(clearMessage());
                        router.push("/forget-password-email")
                    }}>
                        <Text style={styles.forgetPasswordText}>
                            Forget Password
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.headingContainer}>
                <Text style={styles.heading}>LOG IN</Text>
                <Text style={styles.context}>
                    Forgot your password? Just try logging in—if it's wrong, 'Forgot Password' will pop up!
                </Text>
            </View>


            <View style={styles.inputForm}>
                <View style={styles.inputContainer}>
                    <TextInput id="username"
                        name="username"
                        placeholder="Username"
                        value={values.username}
                        onChangeText={(value) => handleUsernameChange("username", value)}
                        onBlur={handleBlur('username')}
                        style={styles.input}
                        placeholderTextColor="#1e1e1e"
                    />
                    {errors.username && touched.username && (
                        <ValidationError errors={errors.username} />
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.passwordInput}>
                        <TextInput id="password"
                            name="password"
                            placeholder="Password"
                            value={values.password}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            secureTextEntry={!showPassword}
                            style={styles.input}
                            placeholderTextColor="#1e1e1e"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordPrivacyIcon}>
                            {showPassword ? (
                                <Image source={require("../../assets/images/view.png")} style={{width: 20, height: 20}} />
                            ) : (
                                <Image source={require("../../assets/images/hidden.png")} style={{width: 20, height: 20}} />
                            )}
                        </TouchableOpacity>
                    </View>
                    {errors.password && touched.password && (
                        <ValidationError errors={errors.password} />
                    )}
                </View>

                <View style={styles.loginButtonContainer}>
                <TouchableOpacity onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                    style={styles.loginButton}
                >
                    {isSubmitting ? <ActivityIndicator color="#000" /> : <Text style={styles.loginButtonText}>Login</Text>}
                </TouchableOpacity>
            </View>
            </View>

            <View style={styles.createAccountLink}>
                <Text style={styles.createAccountLinkText}>
                    Do you have an account?
                </Text>
                <TouchableOpacity onPress={() => {
                    router.push('/sign-up')
                }}>
                    <Text style={styles.createAccountText}>Create Account </Text>
                </TouchableOpacity>
            </View>

            <Toast />
        </View>
    );

};


const styles = StyleSheet.create({
    section: {
        padding: rem(1),
        height: "100%",
        backgroundColor: "#000",
    },
    headingContainer: {
        marginVertical: rem(6),
        paddingHorizontal: rem(1)
    },
    heading: {
        fontSize: rem(3),
        fontFamily: "Inter_800ExtraBold",
        color: "rgba(221, 221, 221, 0.97)",
        padding: rem(0.5),
    },
    context: {
        fontSize: rem(1.3),
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: rem(0.5),
        letterSpacing: rem(0.03),
        color: "#d9d9d9"
    },
    inputForm: {
        flexDirection: "column",
        gap: rem(3.5),
        alignItems: "center"
    },
    inputContainer: {
        width: "100%",
        position: "relative",
    },
    input: {
        height: rem(5.3),
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#1e1e1e',
        backgroundColor: "transparent",
        color: '#d9d9d9',
        paddingHorizontal: rem(2.5),
        fontSize: rem(1.6),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.06),
        width: "100%"
    },
    passwordInput: {
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center"
    },
    passwordPrivacyIcon: {
        right: rem(4),
    },
    loginButtonContainer: {
        width: "75%",
        marginTop: rem(8)
    },
    loginButton: {
        width: "100%",
        backgroundColor: "#fff",
        paddingVertical: rem(1),
        paddingHorizontal: rem(5),
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15
    },
    loginButtonText: {
        color: "#000",
        fontSize: rem(1.6),
        fontFamily: "Inter_800ExtraBold",
        letterSpacing: rem(0.05),
    },
    createAccountLink: {
        marginTop: rem(0.5),
        padding: rem(3),
        alignItems: "center",
        gap: 3
    },
    createAccountLinkText: {
        fontSize: rem(1.3),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.03),
        color: "#fff"
    },
    createAccountText: {
        fontSize: rem(1.3),
        color: "#3083FF",
        fontFamily: "Inter_700Bold",
        paddingLeft: rem(0.4),
        letterSpacing: rem(0.02)
    },
    forgetPasswordLink: {
        position: "absolute",
        top: rem(68),
        display: "flex",
        left: "5%",
        width: "95%",
        flexDirection: "column",
        alignItems: "center",
        paddingVertical: rem(1),
        paddingHorizontal: rem(1.5),
        gap: 2,
        backgroundColor: "rgba(179,61,61,0.61)",
        borderWidth: 1,
        borderColor: "#ff0000",
        borderRadius: 13,
        borderCurve: "continuous"
    },
    forgetPasswordMsg: {
        color: "#fff",
        fontSize: rem(1.3),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.03)
    },
    forgetPasswordText: {
        fontSize: rem(1.4),
        color: "#e74c3c",
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.02)
    }
})
