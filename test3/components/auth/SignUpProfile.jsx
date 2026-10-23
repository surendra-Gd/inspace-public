import React, {Fragment, useState} from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Image,
    ScrollView,
    Dimensions
} from "react-native";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import { signUpAction } from "../../service/actions/authActions";
import { signUpSchema } from "../../schemas/authSchemas";
import {useRouter} from "expo-router";
import {rem} from "../../utils/uiUtils";
import ValidationError from "../loader/ValidationError";


export default function SignUpProfile({ email, onBack }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (values) => {
        await dispatch(signUpAction(values, router, values.email));
    };

    const handleTrimChange = (name, value) => {
        handleChange({ target: { name, value: value.trim() } });
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
        handleSubmit,
    } = useFormik({
        initialValues: { username: "", name: "", password: "", email },
        validationSchema: signUpSchema,
        onSubmit,
    });

    return (
        <ScrollView  style={{backgroundColor: "#000", flex: 1}}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => onBack()} style={styles.backButton}>
                    <Image source={require("../../assets/images/back (1).png")} style={{width: 20, height: 20}} />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <Text style={styles.heading}>Sign up</Text>

                <View style={styles.inputForm}>

                    <View>
                        <TextInput id="username"
                            name="username"
                            placeholder="Username"
                            value={values.username}
                            onChangeText={(value) => handleUsernameChange("username", value)}
                            onBlur={handleBlur("username")}
                            style={styles.input}
                            autoComplete="off"
                            placeholderTextColor={"rgba(117, 117, 117, 0.709)"}
                        />
                        {errors.username && touched.username && (
                            <ValidationError errors={errors.username} />
                        )}
                    </View>

                    <View>
                        <TextInput id="name"
                            name="name"
                            placeholder="Name"
                            value={values.name}
                            onChangeText={handleChange("name")}
                            onBlur={handleBlur("name")}
                            style={styles.input}
                            autoComplete="off"
                            placeholderTextColor={"rgba(117, 117, 117, 0.709)"}
                        />
                        {errors.name && touched.name && (
                            <ValidationError errors={errors.name} />
                        )}
                    </View>

                    <View>
                        <View style={styles.passwordField}>
                            <TextInput id="password"
                                name="password"
                                placeholder="Password"
                                secureTextEntry={!showPassword}
                                value={values.password}
                                onChangeText={(value) => handleTrimChange("password", value)}
                                onBlur={handleBlur("password")}
                                style={styles.input}
                                autoComplete="off"
                                placeholderTextColor={"rgba(117, 117, 117, 0.709)"}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}
                                style={styles.passwordPrivacyIcon}
                            >
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

                </View>
            </View>

            <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleSubmit()}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={styles.submitButtonText}>Create Account</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: rem(7),
        padding: rem(0.5),
        backgroundColor: "#000",
    },
    header: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: "flex-end",
        gap: 15,
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingTop: 25,
        zIndex: 1000,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    heading: {
        color: "rgba(221, 221, 221, 0.97)",
        paddingVertical: rem(2.5),
        paddingHorizontal: rem(2),
        textTransform: "uppercase",
        letterSpacing: rem(0.1),
        fontSize: rem(2.6),
        fontFamily: "Inter_700Bold"
    },
    inputForm: {
        paddingTop: rem(1.5),
        paddingBottom: rem(2),
        gap: rem(3)
    },
    input: {
        alignSelf: "center",
        width: "98%",
        height: 56,
        paddingLeft: rem(2),
        paddingRight: rem(1),
        borderWidth: 1.2,
        borderColor: "#1e1e1e",
        color: "#fff",
        fontSize: rem(1.6),
        fontFamily: "Inter_600SemiBold",
        borderRadius: 18,
        borderCurve: "continuous",
        letterSpacing: rem(0.05),
        backgroundColor: "#000",
    },
    passwordField: {
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
    },
    passwordPrivacyIcon: {
        position: "absolute",
        right: rem(3),
    },
    submitButton: {
        marginTop: rem(20),
        backgroundColor: "#fff",
        width: "86%",
        height: rem(4.7),
        alignSelf: "center",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    submitButtonText: {
        color: "#000",
        fontSize: rem(1.6),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.05)
    },
});