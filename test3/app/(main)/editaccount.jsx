import React from "react";
import {View, Text, StyleSheet, KeyboardAvoidingView, Platform, Pressable} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {updateUserAction} from "../../service/actions/userActions";
import {UPDATE_USERNAME} from "../../service/constants/authConstants";
import EditAvatar from "../../components/settings/EditAvatar";
import {nameSchema, usernameSchema} from "../../schemas/authSchemas";
import EditUser from "../../components/settings/EditUser";
import {rem} from "../../utils/uiUtils";
import {useRouter} from "expo-router";

const EditAccount = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const { userData: user } = useSelector((state) => state.user);
    const { username, name, email, status } = user;


    const updateUserState = async (key, value) => {
        const updatedUser = { ...user, [key]: value };
        dispatch(updateUserAction(updatedUser));
    };

    const updateUsername = async (key, value) => {
        const { user, access_token, refresh_token } = value;
        const profile = {
            user,
            access_token,
            refresh_token,
            isAuthenticated: true,
        };
        await AsyncStorage.setItem("profile", JSON.stringify({ ...value, user: user.userId }));
        dispatch({ type: UPDATE_USERNAME, payload: profile });
    };

    return (
        <View style={styles.container}>
            <EditAvatar user={user} />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.userInfo}>
                <EditUser
                    type="name"
                    value={name}
                    onSuccess={updateUserState}
                    schema={nameSchema}
                />
                <EditUser
                    type="username"
                    value={username}
                    onSuccess={updateUsername}
                    schema={usernameSchema}
                />
                <Pressable style={styles.field} onPress={() => router.push("/changeemailvalidation")}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{email}</Text>
                </Pressable>
                <Pressable style={styles.statusField} onPress={() => router.push("/profile-bio")}>
                    <Text style={styles.label}>Bio</Text>
                    <Text style={styles.value}>{status}</Text>
                </Pressable>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        height: "100%",
        marginTop: rem(7),
        paddingHorizontal: rem(1)
    },
    userInfo: {
        marginTop: rem(3),
    },
    field: {
        marginVertical: rem(2.5),
        justifyContent: "space-between",
        flexDirection: "row",
        paddingVertical: rem(1.7),
        paddingHorizontal: rem(1),
        borderWidth: 1,
        borderColor: "#1E1E1EFF",
        borderRadius: 13,
        borderCurve: "continuous",
        marginBottom: rem(1),
    },
    statusField: {
        marginVertical: rem(2.5),
        justifyContent: "space-between",
        flexDirection: "row",
        paddingVertical: rem(1.7),
        paddingHorizontal: rem(1),
        borderWidth: 1,
        borderColor: "#1E1E1EFF",
        borderRadius: 13,
        borderCurve: "continuous",
        marginBottom: rem(1),
        maxHeight: 100
    },
    label: {
        fontSize: rem(1),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.04),
        color: "#6F6F6FFF",
        textTransform: "uppercase",
        paddingHorizontal: rem(0.01),
        position: "absolute",
        top: 1,
        left: "6%",
        zIndex: 100,
    },
    value: {
        height: "100%",
        paddingTop: 3,
        paddingHorizontal: rem(1),
        color: "#fff",
        fontSize: rem(1.6),
        fontFamily: "Inter_400Regular",
        letterSpacing: rem(0.01),
        textAlign: "left"
    },
});

export default EditAccount;