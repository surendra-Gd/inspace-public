import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {rem} from "../../utils/uiUtils";
import UserBio from "./UserBio";
import ProfileImageViewer from "./PostImageViewer";

const ProfileCard = ({ user }) => {
    const { profile, username, name, status } = user;

    return (
        <View style={styles.container}>
            <View style={styles.userSection}>
                <ProfileImageViewer profilePic={profile} picStyle={styles.userImage} />
            </View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.userName}>{username}</Text>
            {status && <UserBio bio={status} /> }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: rem(0.8),
    },
    userSection: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 25,
        marginBottom: rem(1),
    },
    userImage: {
        width: rem(12),
        height: rem(12),
        borderRadius: 20,
        objectFit: "cover",
    },
    name: {
        fontSize: rem(2),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.1),
        color: "#fff",
    },
    userName: {
        fontSize: rem(1.7),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.03),
        color: "#6F6F6FFF",
    },
});

export default ProfileCard;