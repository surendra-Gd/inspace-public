import React from "react";
import {Image, Pressable, StyleSheet, Text, View} from "react-native";
import {useRouter} from "expo-router";
import {rem} from "../../utils/uiUtils";

const AccountSection = () => {
    const router = useRouter();

    const handleNavigate = (route) => {
        router.push(route);
    };

    return (
        <>
            <Pressable onPress={() => handleNavigate("changeemailvalidation")}>
                <View style={styles.settingItem}>
                    <Image source={require("../../assets/images/email.png")} style={styles.settingIcon}/>
                    <Text style={styles.settingItemName}>Change Email</Text>
                </View>
            </Pressable>

            <Pressable onPress={() => handleNavigate("changepassword")}>
                <View style={styles.settingItem}>
                    <Image source={require("../../assets/images/lock.png")} style={{width: 23, height: 23}}/>
                    <Text style={styles.settingItemName}>Change Password</Text>
                </View>
            </Pressable>
            <Pressable onPress={() => handleNavigate("profile-bio")}>
                <View style={styles.settingItem}>
                    <Image source={require("../../assets/images/info-button.png")} style={{width: 23, height: 23}}/>
                    <Text style={styles.settingItemName}>Profile Bio</Text>
                </View>
            </Pressable>

        </>
    );
};


export default AccountSection;

const styles = StyleSheet.create({
    settingItem: {
        padding: rem(1.3),
        backgroundColor: "rgba(21, 21, 21, 1)",
        borderRadius: 10,
        marginBottom: rem(2),
        flexDirection: "row",
        paddingLeft: rem(2),
        gap: rem(1.5)
    },
    settingIcon: {
        width: 25,
        height: 25
    },
    settingItemName: {
        color: "#d9d9d9",
        fontFamily: "Inter_600SemiBold",
        fontSize: rem(1.4),
        letterSpacing: rem(0.03)
    },
});