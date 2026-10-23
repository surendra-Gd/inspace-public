import {Image, Text, TouchableOpacity, View, StyleSheet} from "react-native";
import React from "react";
import {useRouter} from "expo-router";

export default function AccountHeader() {
    const router = useRouter();

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Image source={require("../../assets/images/back (1).png")} style={{width: 20, height: 20}} />
            </TouchableOpacity>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity onPress={() => router.push("/settings")} style={styles.backButton}>
                <Image source={require("../../assets/images/setting.png")} style={{width: 20, height: 20}} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        top: 0,
        width: '100%',
        height: 70,
        alignSelf: "flex-end",
        gap: 15,
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingTop: 25,
        zIndex: 1000,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    title: {
        fontFamily: "Inter_600SemiBold",
        fontSize: 17,
        letterSpacing: 0.9,
        color: "#fff"
    },
})