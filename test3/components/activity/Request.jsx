import React, { memo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { handleSpaceRequestAction } from '../../service/actions/spaceActions';
import {useRouter} from "expo-router";
import {rem} from "../../utils/uiUtils";


const Request = ({ request }) => {
    const { user, requestId } = request;
    const dispatch = useDispatch();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleAction = async (action) => {
        setLoading(true);
        const formData = { requestId, status: action };
        await dispatch(handleSpaceRequestAction(user, formData));
        setLoading(false);
    };

    const handleNavigationToProfile = () => {
        router.push({
            pathname: "/profile/[username]",
            params: {username: user?.username}
        })
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleNavigationToProfile}
                style={styles.userContainer}
            >
                <Image source={{ uri: user.profile }} style={styles.userImage} />
                <View style={styles.userDetails}>
                    <Text style={styles.username}>{user.username}</Text>
                    <Text style={styles.name}>{user.name}</Text>
                </View>
                {!request.seen && (
                    <View style={styles.unseenIcon}></View>
                )}
            </TouchableOpacity>
            <View style={styles.actionsContainer}>
                {loading ? (
                    <ActivityIndicator size="small" color="#0000ff" />
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => handleAction("ACCEPT")}
                            disabled={loading}
                        >
                            <Image source={require("../../assets/images/check.png")} style={{width: 28, height: 28}} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.rejectButton}
                            onPress={() => handleAction("DECLINE")}
                            disabled={loading}
                        >
                            <Image source={require('../../assets/images/decline.png')} style={{width: 34, height: 34}} />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: "stretch",
        padding: rem(0.5),
        marginTop: 10,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: rem(1.2)
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    userDetails: {
        flexDirection: 'column',
        gap: rem(0.5)
    },
    name: {
        fontSize: rem(1.4),
        letterSpacing: rem(0.01),
        fontFamily: "Inter_500Medium",
        color: "#6F6F6FFF"
    },
    username: {
        fontSize: rem(1.5),
        fontFamily: "Inter_600SemiBold",
        color: '#fff',
        letterSpacing: rem(0.06)
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: "center",
        gap: rem(1.7),
    },
    unseenIcon: {
        zIndex: 1001,
        position: "absolute",
        right: 12,
        backgroundColor: "yellow",
        width: 13,
        height: 13,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4
    },
});

export default memo(Request);