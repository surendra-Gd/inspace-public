import React, {memo, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {SPACES_ERROR} from "../../../service/constants/userConstants";
import {getUserSpacesAction} from "../../../service/actions/userActions";


import Space from '../../../components/main/Space';
import {useRouter} from "expo-router";
import {rem} from "../../../utils/uiUtils";

const MemoizedSpace = memo(Space);


export default function Spaces() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const {userSpaces, spaces} = useSelector(state => state.user);
    const {errors} = useSelector(state => state.app);
    const spacesError = errors["spaces"]?.error === SPACES_ERROR || false;


    useEffect(() => {
        const fetchSpaces = async () => {
            if (userSpaces?.length) return;
            await dispatch(getUserSpacesAction());
        };
        fetchSpaces().finally(() => setLoading(false));
    }, [dispatch]);


    if (loading) return <ActivityIndicator color={"#fff"} size={25} style={styles.loadingStyle}/>;


    return (
        <View style={styles.section}>
            {spacesError ? (
                <Text style={styles.errorMessage}>Unable to load the spaces</Text>
            ) : (
                userSpaces?.length > 0 ? (
                    <View style={styles.container}>
                        {userSpaces.map(userSpace => {
                            const space = spaces[userSpace.spaceId];
                            return (
                                <MemoizedSpace key={space.spaceId}
                                               userSpace={{
                                                   ...space,
                                                   members: userSpace.members,
                                                   admin: userSpace.admin
                                               }}
                                               dispatch={dispatch}
                                />
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.welcomeMessage}>
                            🌟 Welcome to Private Spaces
                        </Text>
                        <Text style={styles.messageContent}>
                            {"\n"}
                            🚀 Not just a group—it's a mini-app!
                            {"\n\n"}
                            👥 Be yourself with close friends, no pressure!
                            {"\n\n"}
                            ⚡ Instant & real-time—stay connected!
                            {"\n\n"}
                            📸 Share memories, chat, and express yourself with texts
                            {"\n\n"}
                            🔒 A safe, comfortable space—just for you & your circle
                            {"\n\n"}
                            ✨ More than DMs, better than groups—it’s YOUR space
                            {"\n\n"}
                            🔥 Ready to vibe? Tap the ➕ button below to create or join a space! 🚀
                        </Text>
                    </View>
                ))}

            <TouchableOpacity
                style={styles.createLink}
                onPress={() => router.push("/createspace")}
            >
                <Image source={require("../../../assets/images/plus (1).png")} style={{width: 30, height: 30}}/>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingStyle: {
        alignSelf: "center",
        top: "30%"
    },
    section: {
        position: "relative",
        top: rem(8.4),
        bottom: rem(15),
        flex: 1,
        backgroundColor: "#000",
    },
    container: {
        marginTop: rem(2),
        paddingHorizontal: rem(1),
        paddingVertical: rem(1),

    },
    errorMessage: {
        width: "72%",
        alignSelf: "center",
        marginTop: rem(2),
        borderWidth: 1,
        borderColor: "rgba(255, 0, 0, 0.52)",
        borderRadius: 5,
        color: "#ff0000",
        backgroundColor: "rgba(120, 52, 52, 0.78)",
        fontSize: rem(1.4),
        fontWeight: "500",
        paddingVertical: rem(1),
        paddingHorizontal: rem(2),
        textAlign: "center",
    },
    nonMessage: {
        marginTop: rem(2),
        paddingHorizontal: rem(1),
        textAlign: "center",
        fontSize: 14,
        color: "#6f6f6f",
        fontFamily: "Inter_500Medium"
    },
    createLink: {
        position: 'absolute',
        left: "75%",
        bottom: "30%",
        backgroundColor: "#fff",
        width: 60,
        height: 60,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        marginTop: rem(2),
        paddingHorizontal: 12,
        paddingVertical: rem(1),
    },
    welcomeMessage: {
        color: '#6f6f6f',
        fontSize: 17,
        fontFamily: "Inter_600SemiBold",
    },
    messageContent: {
        color: '#fff',
        fontSize: 15,
        fontFamily: "Inter_500Medium",
    }
});
