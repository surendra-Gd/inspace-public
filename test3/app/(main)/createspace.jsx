import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Pressable,
    Image
} from 'react-native';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import {API} from "../../service/api/utils";
import {createSpaceAction} from "../../service/actions/userActions";
import {useRouter} from "expo-router";
import {createSpaceSchema} from "../../schemas/appSchemas";
import ErrorComponent from "../../components/shared/ErrorComponent";
import {rem} from "../../utils/uiUtils";
import ValidationError from "../../components/loader/ValidationError";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";


function Createspace() {
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const router = useRouter();

    const onSubmit = async (values, actions) => {
        setError("");
        try {
            const res = await API.post("in-space/space/create", values);
            await AsyncStorage.removeItem('x-ps');
            await createSpaceAction(res?.data, dispatch);
            router.push("/spaces");
            actions.resetForm();
        } catch (err) {
            const { status, error, validationErrors, message } = err?.response?.data || {};
            if (status === 400 && error === "Validation failed") {
                Toast.show({type: "error", text1: validationErrors[0]})
            } else {
                setError(message || "An unexpected error occurred");
            }
        }
    };

    const handleSpaceIdChange = (name, value) => {
        handleChange({target: {name, value: value.trim().toLowerCase()}})
    }

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
            spaceId: "",
            spaceName: ""
        },
        validationSchema: createSpaceSchema,
        onSubmit,
    });

    return (
        <View style={styles.container}>

            <View style={styles.headingContainer}>
                <Text style={styles.heading}>Create Your Space 🏠</Text>
                <Text style={styles.context}>
                    A Space is your own spot in the app,
                    where you can come together, share, and make memories with friends.
                </Text>
            </View>

            <View style={styles.note}>
                <Image source={require("../../assets/images/warning.png")} style={{width: 22, height: 22}} />
                <Text style={styles.noteText}>
                    Choose your Space ID carefully — once it's set, you can’t change it!
                </Text>
            </View>

            <View style={styles.section}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Space ID"
                        value={values.spaceId}
                        onChangeText={(value) => handleSpaceIdChange('spaceId', value)}
                        onBlur={handleBlur('spaceId')}
                        autoComplete="off"
                        placeholderTextColor={"#D9D9D9FF"}
                    />
                    {errors.spaceId && touched.spaceId && (
                        <ValidationError errors={errors.spaceId}/>
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Space Name"
                        value={values.spaceName}
                        onChangeText={handleChange('spaceName')}
                        onBlur={handleBlur('spaceName')}
                        autoComplete="off"
                        placeholderTextColor={"#D9D9D9FF"}
                    />
                    {errors.spaceName && touched.spaceName && (
                        <ValidationError errors={errors.spaceName}/>
                    )}
                </View>


                {error && <ErrorComponent msg={error}/>}

                <TouchableOpacity style={styles.button}
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#000"/>
                    ) : (
                        <Text style={styles.buttonText}>Create</Text>
                    )}
                </TouchableOpacity>


                <Pressable onPress={() => router.push("/joinspace")}
                    style={styles.linkWrapper}
                >
                    <Text style={styles.linkText}>Click to </Text>
                    <Text style={styles.link}>Join Space</Text>
                </Pressable>
            </View>

        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        top: rem(6.7),
        backgroundColor: "#000",
        flex: 1
    },
    headingContainer: {
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
    note: {
        marginTop: rem(0.5),
        marginBottom: rem(2),
        paddingHorizontal: rem(1.5),
        flexDirection: "row",
        alignItems: "center",
        gap: 3
    },
    noteText: {
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: rem(0.5),
        letterSpacing: rem(0.03),
        color: "#ff2020"
    },
    section: {
        paddingVertical: rem(3),
        gap: rem(3.5),
        justifyContent: "center",
        alignItems: "center",
    },
    inputContainer: {
        width: rem(33)
    },
    input: {
        backgroundColor: "#2a2a2a",
        width: "100%",
        height: rem(4.6),
        color: "#fff",
        paddingHorizontal: rem(2),
        borderRadius: 6,
        fontSize: rem(1.5),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.05)
    },
    button: {
        position: "absolute",
        top: rem(39),
        alignSelf: "center",
        width: "82%",
        backgroundColor: "#fff",
        paddingVertical: rem(1.2),
        alignItems: 'center',
        borderRadius: 15,
    },
    buttonText: {
        color: '#000',
        fontSize: rem(1.7),
        fontFamily: "Inter_800ExtraBold",
        letterSpacing: rem(0.03)
    },
    linkWrapper: {
        position: "absolute",
        top: rem(46),
        padding: rem(1),
        alignItems: "center",
        flexDirection: "row",
        alignSelf: "center",
        gap: 2
    },
    linkText: {
        color: "#fff",
        fontFamily: "Inter_600SemiBold",
        fontSize: rem(1.3),
        letterSpacing: rem(0.03)
    },
    link: {
        fontSize: rem(1.5),
        fontFamily: "Inter_700Bold",
        color: '#3083FF',
        letterSpacing: rem(0.03)
    },
});

export default Createspace;