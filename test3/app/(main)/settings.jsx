import React, { useState } from "react";
import {View, Text, Image, StyleSheet, Modal, Pressable, ScrollView} from "react-native";
import { useSelector } from "react-redux";
import AccountSection from "../../components/settings/AccountSection";
import AboutSection from "../../components/settings/AboutSection";
import LogOutModal from "../../components/modal/LogOutModal";
import {useRouter} from "expo-router";
import {rem} from "../../utils/uiUtils";


export default function Settings() {
    const router = useRouter();
    const { userData } = useSelector((state) => state.user);
    const { profile, name, username } = userData || {};
    const [logoutModal, setLogoutModal] = useState(false);

    return (
        <ScrollView style={styles.container}>

            <View style={styles.mainDivision}>
                <Pressable onPress={() => router.push("/editaccount")} style={styles.accountProfile}>
                    {profile && (
                        <Image source={{uri: profile}} style={styles.accountImage}/>
                    )}
                    <View>
                        <Text style={styles.accountName}>{username}</Text>
                        <Text style={styles.accountUsername}>{name}</Text>
                    </View>
                </Pressable>
            </View>

            <View>
                <Text style={styles.divisionHeading}>General</Text>
                <AccountSection />
                <AboutSection />
            </View>

            <Pressable style={styles.logout}
                onPress={() => setLogoutModal(true)}
            >
                <Text style={styles.logoutButton}>Logout</Text>
            </Pressable>

            <Modal
                visible={logoutModal}
                transparent={true}
                animationType="slide"
            >
                <LogOutModal onClose={() => setLogoutModal(false)} isVisible={logoutModal}/>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: rem(4),
        flex: 1,
        padding: rem(1),
        backgroundColor: "#000"
    },
    mainDivision: {
        marginTop: rem(3),
        paddingHorizontal: rem(0.05),
    },
    accountProfile: {
        paddingVertical: rem(2.2),
        paddingHorizontal: rem(2),
        backgroundColor: "#151515C4",
        borderRadius: 10,
        gap: 25,
        marginBottom: rem(1),
        flexDirection: "row",
        alignItems: "center"
    },
    accountImage: {
        width: rem(6),
        height: rem(6),
        borderRadius: 30,
        objectFit: "contain",
    },
    accountName: {
        fontSize: rem(1.8),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.1),
        color: "#fff",
    },
    accountUsername: {
        color: "#6F6F6FFF",
        fontSize: rem(1.6),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.05),
        marginTop: 7
    },
    divisionHeading: {
        fontSize: rem(1.5),
        fontFamily: "Inter_800ExtraBold",
        marginVertical: rem(1),
        marginHorizontal: rem(2),
        color: "#3083FFFF",
        letterSpacing: 0.7
    },
    logout: {
        marginTop: rem(2),
        paddingVertical: rem(0.9),
        backgroundColor: "#e74c3c",
        borderRadius: 10,
        alignItems: "center",
        marginBottom: rem(4)
    },
    logoutButton: {
        color: "#000",
        fontFamily: "Inter_800ExtraBold",
        fontSize: rem(1.6),
        letterSpacing: rem(0.03)
    }
});