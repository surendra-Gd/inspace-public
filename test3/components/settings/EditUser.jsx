import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    Pressable
} from 'react-native';
import { useFormik } from 'formik';
import { API } from '../../service/api/utils';
import {rem} from "../../utils/uiUtils";
import Toast from "react-native-toast-message";


const EditUser = ({ type, value, onSuccess, schema }) => {
    const [edit, setEdit] = useState(false);
    const inputRef = useRef();

    const onSubmit = async (values, actions) => {
        const updated = values[type];
        if (!updated || updated === value) return;

        try {
            const res = await API.put(`users/${type}?${type}=${updated}`);
            setEdit(false);
            actions.resetForm();
            onSuccess(type, res?.data);
        } catch (err) {
            const message = err?.response?.data?.message || "Unexpected error occurred.";
            Toast.show({type: "error", text1: message})
        }
    };

    useEffect(() => {
        if (edit && inputRef.current) {
            inputRef.current?.focus();
        }
    }, [edit]);

    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        resetForm,
        handleSubmit,
    } = useFormik({
        initialValues: {
            [type]: value,
        },
        enableReinitialize: true,
        validationSchema: schema,
        onSubmit,
    });

    const handleEdit = (value) => {
        if(edit === value) return;
        resetForm();
        setEdit(value);
    };

    useEffect(() => {
        if (errors[type] && touched[type]) {
            const errMsg = errors[type];
            Toast.show({type: "error", text1: errMsg})
        }
    }, [errors, touched]);

    const handleTrimChange = (name, value) => {
        let res = name === "username" ? value.trim().toLowerCase() : value
        handleChange({target: {name, value: res}})
    };

    return (
         <Pressable style={styles.container} onPress={() => handleEdit(true)}>
             <Text style={styles.label}>{type}</Text>
             {edit ? (
                 <View style={styles.form}>
                     <TextInput id={type}
                         name={type}
                         value={values[type]}
                         onChangeText={(value) => handleTrimChange(type, value)}
                         onBlur={handleBlur(type)}
                         required
                         autoComplete="off"
                         ref={inputRef}
                         style={styles.input}
                         onSubmitEditing={handleSubmit}
                     />
                 </View>
             ) : (
                 <Text style={styles.value} onPress={() => handleEdit(true)}>{value}</Text>
             )}

             <View style={styles.actionIcons}>
                 {isSubmitting ? (
                     <ActivityIndicator size="small" color={"#fff"} />
                 ) : (
                     edit ? (
                         <TouchableOpacity onPress={() => handleEdit(false)} style={styles.actionIcon}>
                             <Image source={require("../../assets/images/x-button.png")} style={{width: 22, height: 22}} />
                         </TouchableOpacity>
                     ) : null
                 )}
             </View>
         </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: rem(2),
        justifyContent: "space-between",
        flexDirection: "row",
        paddingVertical: rem(1.7),
        paddingHorizontal: rem(1),
        borderWidth: 1,
        borderColor: "#1E1E1EFF",
        borderRadius: 13,
        borderCurve: "continuous",
    },
    label: {
        fontSize: rem(1),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.04),
        color: "#6F6F6FFF",
        textTransform: "uppercase",
        paddingHorizontal: rem(0.01),
        position: "absolute",
        top: 2,
        left: "6%",
        zIndex: 100,
    },
    form: {
        height: rem(2.6),
        paddingHorizontal: rem(1),
        flex: 1
    },
    input: {
        color: "#fff",
        top: 5,
        fontSize: rem(1.6),
        fontFamily: "Inter_400Regular",
        letterSpacing: rem(0.01),
        textAlign: "left"
    },
    value: {
        height: "100%",
        top: 5,
        paddingHorizontal: rem(1),
        color: "#fff",
        fontSize: rem(1.6),
        fontFamily: "Inter_400Regular",
        letterSpacing: rem(0.01),
        textAlign: "left"
    },
    actionIcons: {
        marginRight: rem(0.7),
        marginTop: rem(0.2)
    },
    actionIcon: {
        height: rem(2),
        width: rem(2),
        position: "relative"
    },

});

export default EditUser;