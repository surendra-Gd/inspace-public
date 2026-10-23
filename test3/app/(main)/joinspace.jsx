import React, { useState } from 'react';
import {Text, StyleSheet, View, TextInput, ActivityIndicator, Image} from 'react-native';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import {getSpaceAction} from "../../service/actions/userActions";
import {spaceIdSchema} from "../../schemas/appSchemas";
import JoinSpaceModal from "../../components/shared/JoinSpaceModal";
import {rem} from "../../utils/uiUtils";
import ValidationError from "../../components/loader/ValidationError";

export default function JoinSpace() {
    const [uniqueId, setUniqueId] = useState("");
    const dispatch = useDispatch();

    const { spaces } = useSelector(state => state.user);
    const space = Object.values(spaces).find(space => space.uniqueId === uniqueId);

    const onSubmit = async (values) => {
        if (values.spaceId === space?.uniqueId) return;
        setUniqueId(values.spaceId);
        await dispatch(getSpaceAction(values.spaceId));
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
        initialValues: { spaceId: "" },
        validationSchema: spaceIdSchema,
        onSubmit
    });

    return (
        <View style={styles.container}>

            <View style={styles.form}>
                <View style={styles.iconContainer}>
                    <Image source={require("../../assets/images/find.png")} style={{width: 20, height: 20}} />
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Space Id"
                    value={values.spaceId}
                    onChangeText={(value) => handleSpaceIdChange('spaceId', value)}
                    onBlur={handleBlur('spaceId')}
                    autoComplete="off"
                    placeholderTextColor={"#D9D9D9FF"}
                    onSubmitEditing={() => handleSubmit()}
                />
            </View>

            <View style={styles.errorContainer}>
                {errors.spaceId && touched.spaceId && (
                    <ValidationError errors={errors.spaceId} />
                )}
            </View>

            {isSubmitting && <ActivityIndicator color={"#fff"} size={"small"} />}

            {space ? (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultName}>{space?.spacename}</Text>
                    <Text style={styles.resultId}>{space?.uniqueId}</Text>
                    <JoinSpaceModal space={space}
                        className1={styles.requestedButton}
                        className2={styles.joinButton}
                        joinButtonText={styles.joinButtonText}
                        requestButtonText={styles.requestButtonText}
                    />
                </View>
            ) : null}
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        top: rem(7.3),
        backgroundColor: "#000",
        flex: 1,
        paddingHorizontal: rem(1)
    },
    form: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: rem(1),
        marginBottom: rem(1.5),
        alignSelf: "center"
    },
    input: {
        backgroundColor: "rgba(16, 16, 16, 1)",
        width: "95%",
        height: rem(4.5),
        paddingLeft: rem(5),
        color: "#d9d9d9",
        fontSize: rem(1.6),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.03)
    },
    iconContainer: {
        position: "absolute",
        left: 15,
        zIndex: 1001
    },
    errorContainer: {
        marginLeft: rem(1)
    },
    resultContainer: {
        marginTop: rem(4),
        justifyContent: "center",
        paddingVertical: rem(2.4),
        paddingHorizontal: rem(2),
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
    },
    resultName: {
        fontSize: rem(1.7),
        fontFamily: "Inter_600SemiBold",
    },
    resultId: {
        fontSize: rem(1.6),
        fontFamily: "Inter_700Bold",
        color: '#555',
    },
    requestedButton: {
        marginTop: rem(2.5),
        backgroundColor: "#ff2020",
        alignSelf: "center",
        paddingVertical: rem(0.8),
        paddingHorizontal: rem(4),
        borderRadius: 13
    },
    joinButton: {
        marginTop: rem(2.5),
        backgroundColor: "#000",
        alignItems: "center",
        marginHorizontal: rem(2),
        paddingVertical: rem(0.8),
        paddingHorizontal: rem(1.8),
        borderRadius: 13
    },
    joinButtonText: {
        color: '#fff',
        fontSize: rem(1.8),
        fontFamily: "Inter_800ExtraBold",
        letterSpacing: rem(0.04)
    },
    requestButtonText: {
        color: '#000',
        fontSize: rem(1.5),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.04)
    }
});
