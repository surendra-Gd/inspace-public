import React, { memo } from 'react';
import {View, Text, Image, StyleSheet, Pressable} from 'react-native';
import AddRequest from '../shared/AddRequest';
import RemoveRequest from '../shared/RemoveRequest';
import {useRouter} from "expo-router";
import {rem} from "../../utils/uiUtils";

const SuggestedUser = ({ request }) => {
    const router = useRouter();
    const { user, requestId } = request;

    const handleProfileNavigation = () => {
        router.push({
            pathname: '/profile/[username]',
            params: { username: user?.username },
        });
    };

    return (
        <View style={styles.suggestedUserItem}>
            <Pressable onPress={handleProfileNavigation} style={styles.userDetails}>
                <Image source={{ uri: user?.profile }} style={styles.userImage} />
                <View style={styles.userInfo}>
                    <Text style={styles.username}>{user?.username}</Text>
                    <Text style={styles.name}>{user?.name}</Text>
                </View>
            </Pressable>
            <View style={styles.requestButton}>
                {requestId === null ? (
                    <AddRequest user={user}
                        text="ADD"
                        className1={styles.addButtonContainer}
                        className2={styles.addButton}
                        className3={styles.addButtonText}
                    />
                ) : (
                    <RemoveRequest request={request}
                        text="ADDED"
                        className1={styles.addedButtonContainer}
                        className2={styles.addedButton}
                        className3={styles.addedButtonText}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    suggestedUserItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: rem(2.5)
    },
    userDetails: {
        flexDirection: 'row',
        justifyContent: "flex-start",
        flex: 1,
        marginLeft: rem(0.7),
        gap: 12,
        alignItems: "stretch",
        textAlign: "center",
    },
    userImage: {
        width: 53,
        height: 53,
        borderRadius: 50,
        objectFit: "cover"
    },
    userInfo: {
        alignContent: "space-between",
        gap: 6,
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
    requestButton: {
        width: 75,
        justifyContent: "center",
        alignItems: "center",
        height: 30
    },
    addButtonContainer: {
        width: 55,
        height: 30,
        justifyContent: "center",
        alignItems: "center"
    },
    addButton: {
        backgroundColor: "#fff",
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
    },
    addButtonText: {
        fontFamily: "Inter_900Black",
        letterSpacing: rem(0.03),
        fontSize: rem(1.3),
        color: "#000"
    },
    addedButtonContainer: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    addedButton: {
        backgroundColor: "#1e1e1e",
        borderRadius: 50,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    addedButtonText: {
        color: '#007BFFFF',
        fontFamily: "Inter_700Bold",
        fontSize: rem(1.3),
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        letterSpacing: rem(0.02),
        textAlign: 'center',
    }
});

export default memo(SuggestedUser);