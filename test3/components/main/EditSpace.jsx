import { useFormik } from 'formik';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import {addActionLoading, removeActionLoading} from "../../service/actions/appActions";
import {SPACE_UPDATING} from "../../service/constants/appConstants";
import {API} from "../../service/api/utils";
import {updateSpaceAction} from "../../service/actions/userActions";
import {spaceNameSchema} from "../../schemas/appSchemas";
import {rem} from "../../utils/uiUtils";
import {Modal, TextInput, TouchableOpacity, View, StyleSheet, Image, Text} from "react-native";
import React from "react";

const EditSpace = ({ spaceId, spacename, isEdit, onSuccess, onClose }) => {
    const dispatch = useDispatch();

    const onSubmit = async (values, actions) => {
        if (spacename === values.spacename) return;
        const request = {
            "spaceId": spaceId,
            "spacename": values.spacename
        }
        try {
            dispatch(addActionLoading(spaceId, SPACE_UPDATING));
            const res = await API.put('/in-space/space/update', request);
            await dispatch(updateSpaceAction(res?.data, spaceId));
            actions.resetForm();
            onSuccess();
        } catch (err) {
            Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Unexpected error occurred' });
        } finally {
            dispatch(removeActionLoading(spaceId, SPACE_UPDATING));
        }
    };

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting
    } = useFormik({
        initialValues: {
            spacename: spacename,
        },
        enableReinitialize: true,
        validationSchema: spaceNameSchema,
        onSubmit,
    });

    return (
        <Modal visible={isEdit} animationType="slide" transparent={true} onRequestClose={() => onClose()}>
            <View style={styles.modalOverlay} pointerEvents="box-none">
                <View style={styles.modalContainer}>

                    <TouchableOpacity onPress={() => onClose()}
                        style={styles.closeIcon}
                        pointerEvents="box-only"
                    >
                        <Image source={require("../../assets/images/cross (1).png")}
                               style={styles.closeIconImage}
                        />
                    </TouchableOpacity>

                    <View style={styles.headingContainer}>
                        <Text style={styles.heading}>
                            Edit Space
                        </Text>
                        <Text style={styles.context}>
                            The Space ID can’t be changed, but feel free to update the Space name below!
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <TextInput style={styles.input}
                            placeholder="Enter space name"
                            value={values.spacename}
                            onChangeText={handleChange('spacename')}
                            onBlur={handleBlur('spacename')}
                        />

                        {(errors?.spacename && touched?.spacename) && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{errors?.spacename}</Text>
                            </View>
                        )}

                        <TouchableOpacity onPress={() => handleSubmit()}
                            style={styles.button} disabled={isSubmitting}
                        >
                            <Text style={styles.buttonText}>{isSubmitting ? "Updating..." : "Update"}</Text>
                        </TouchableOpacity>

                    </View>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    form: {
        marginBottom: rem(2),
        alignItems: "center"
    },
    input: {
        fontSize: rem(2),
        textAlign: "center",
        fontFamily: "Inter_800ExtraBold",
        minHeight: rem(2.5),
        width: "100%",
        color: "#000",
        backgroundColor: "#fff",
        paddingVertical: rem(0.5),
        paddingHorizontal: rem(1),
        marginBottom: 10,
        letterSpacing: rem(0.01)
    },
    button: {
        backgroundColor: "#1e1e1e",
        width: "90%",
        paddingVertical: rem(1),
        paddingHorizontal: rem(3),
        borderRadius: 15,
        marginTop: rem(6),
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center"
    },
    buttonText: {
        color: "#fff",
        fontSize: rem(1.6),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.07)
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContainer: {
        width: '100%',
        height: '50%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 10,
    },
    closeIcon: {
        position: "absolute",
        top: rem(0),
        right: rem(1),
        paddingHorizontal: rem(1),
        paddingVertical: rem(1),
        zIndex: 1000
    },
    closeIconImage: {
        width: 33,
        height: 33,
    },
    headingContainer: {
        marginVertical: rem(1),
        paddingHorizontal: rem(1)
    },
    heading: {
        fontSize: rem(2),
        fontFamily: "Inter_700Bold",
        color: "#1e1e1e",
        padding: rem(0.5),
    },
    context: {
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: rem(0.5),
        letterSpacing: rem(0.03),
        color: "#ff2020"
    },
    errorContainer: {
        marginTop: rem(0.6),
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    errorText: {
        color: "#FF0000FF",
        fontSize: rem(1.3),
        fontFamily: "Inter_800ExtraBold",
        marginLeft: rem(1),
        marginBottom: rem(1)
    },
});

export default EditSpace;