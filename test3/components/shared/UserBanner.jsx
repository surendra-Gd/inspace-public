import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import {useRouter} from "expo-router";
import {rem} from "../../utils/uiUtils";

const UserBanner = ({ user, currentId }) => {
    const { profile, name, username, userId: targetId } = user;
    const router = useRouter();

    const handleViewProfile = () => {
        if (currentId === targetId) {
            router.push('/account');
        } else {
            router.push({
                pathname: '/profile/[username]',
                params: { username },
            });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.userBannerSection}>
                {profile && (
                    <Image source={{ uri: profile }} style={styles.profileImage} resizeMode={"cover"} />
                )}
                <View style={styles.details}>
                    <Text style={styles.username}>{username}</Text>
                    <Text style={styles.name}>{name}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={handleViewProfile} style={styles.viewProfileButton}>
                <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    userBannerSection: {
        flexDirection: 'row',
        justifyContent: "flex-start",
        flex: 1,
        gap: 12,
        alignItems: "center"
    },
    profileImage: {
        width: 53,
        height: 53,
        borderRadius: 50,
        resizeMode: "cover",
    },
    details: {
        alignContent: "space-between",
        rowGap: 6,
    },
    username: {
        color: "#fff",
        fontFamily: "Inter_500Medium",
        fontSize: rem(1.4),
        fontWeight: "500",
        letterSpacing: rem(0.04)
    },
    name: {
        fontSize: rem(1.3),
        fontFamily: "Inter_600SemiBold",
        fontWeight: "500",
        letterSpacing: rem(0.05),
        color: "#6F6F6FFF"
    },
    viewProfileButton: {
        marginRight: rem(1.2),
        backgroundColor: "#fff",
        paddingVertical: rem(0.2),
        paddingHorizontal: rem(1.3),
        borderRadius: 5,
    },
    buttonText: {
        color: '#000',
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.02)
    },
});

export default UserBanner;
