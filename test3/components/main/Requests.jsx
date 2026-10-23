import React, {useEffect} from 'react';
import {View, Text, Image, StyleSheet, Pressable} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import AcceptRejectBtn from '../shared/AcceptRejectBtn';
import RemoveRequest from '../shared/RemoveRequest';
import {useRouter} from "expo-router";
import {rem} from "../../utils/uiUtils";
import {SET_REDUX_FRIEND_REQUESTS_SEEN, UPDATE_FRIEND_REQUESTS_SEEN} from "../../service/constants/userConstants";

const Requests = () => {
    const router = useRouter();
    const { incomingRequests, outgoingRequests } = useSelector(state => state.user);
    const dispatch = useDispatch();


    useEffect(() => {
        if(incomingRequests.length === 0) return;
        const isExists = incomingRequests?.some(i => i?.seen === false);
        if(isExists) {
            dispatch({type: UPDATE_FRIEND_REQUESTS_SEEN});
        }
        return () => {
            if(isExists) {
                dispatch({type: SET_REDUX_FRIEND_REQUESTS_SEEN})
            }
        };
    }, [incomingRequests])

    if (incomingRequests.length === 0 && outgoingRequests.length === 0) {
        return (
            <View style={styles.nonMessageContainer}>
                <Text style={styles.nonMessageText}>
                    You don't have any friend requests at the moment. Start connecting with others to see requests here!
                </Text>
            </View>
        );
    }


    const handleNavigateToProfile = (username) => {
        router.push({
            pathname: "/profile/[username]",
            params: {username: username}
        })
    }

    return (
        <View style={styles.section}>
            {incomingRequests.length !== 0 && (
                <View style={styles.incomingContainer}>
                    <View style={styles.heading}>
                        <Text style={styles.title}>Incoming</Text>
                    </View>

                    {incomingRequests.map(r => (
                        <View key={r.requestId} style={styles.requestItem}>
                            <Pressable style={styles.userDetails}
                                onPress={() => handleNavigateToProfile(r.user.username)}
                            >
                                <Image source={{ uri: r.user.profile }} style={styles.userImage} />
                                <View style={styles.userInfo}>
                                    <Text style={styles.username}>{r.user.username}</Text>
                                    <Text style={styles.name}>{r.user.name}</Text>
                                </View>
                                {!r.seen && (
                                    <View style={styles.unseenIcon}></View>
                                )}
                            </Pressable>
                            <AcceptRejectBtn request={r} text1="ACCEPT"
                                className1={styles.buttonContainer}
                                className2={styles.acceptButton}
                                className3={styles.rejectButton}
                                textStyle={styles.acceptButtonText}
                                loaderStyle={styles.loaderStyle}
                            />
                        </View>
                    ))}
                </View>
            )}

            {outgoingRequests.length !== 0 && (
                <View style={styles.outgoingContainer}>
                    <View style={styles.heading}>
                        <Text style={styles.title}>Outgoing</Text>
                    </View>

                    {outgoingRequests.map(r => (
                        <View key={r.requestId} style={styles.requestItem}>
                            <Pressable style={styles.userDetails}
                                onPress={() => handleNavigateToProfile(r.user.username)}
                            >
                                <Image source={{ uri: r.user.profile }} style={styles.userImage} />
                                <View style={styles.userInfo}>
                                    <Text style={styles.username}>{r.user.username}</Text>
                                    <Text style={styles.name}>{r.user.name}</Text>
                                </View>
                            </Pressable>
                            <RemoveRequest request={r} text="ADDED"
                                className1={styles.addedButtonContainer}
                                className2={styles.addedButton}
                                className3={styles.addedButtonText}
                            />
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginVertical: rem(0.3),
        paddingBottom: rem(10)
    },
    incomingContainer: {
        marginBottom: rem(2),
        paddingHorizontal: rem(0.4)
    },
    outgoingContainer: {
        marginBottom: rem(4.5),
        paddingHorizontal: rem(0.4)
    },
    heading: {
        paddingVertical: rem(0.4),
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: rem(1),
        marginBottom: rem(2.5),
        marginLeft: rem(3.5),
        gap: 4
    },
    title: {
        backgroundColor: "#6f6f6f",
        color: "#000",
        borderRadius: 8,
        borderCurve: "circular",
        fontSize: rem(1.4),
        fontFamily: "Inter_700Bold",
        paddingHorizontal: rem(1.4),
        paddingVertical: rem(0.2),
        letterSpacing: rem(0.03),
    },
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: rem(2.5),
        paddingHorizontal: rem(0.1)
    },
    userDetails: {
        flexDirection: 'row',
        justifyContent: "flex-start",
        flex: 1,
        marginLeft: rem(0.7),
        gap: 12,
        alignItems: "center",
        textAlign: "center",
    },
    userImage: {
        width: 53,
        height: 53,
        borderRadius: 50,
        objectFit: "cover",
    },
    userInfo: {
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
    acceptButton: {
        textTransform: "uppercase",
        backgroundColor: "#007BFFFF",
        paddingVertical: rem(0.4),
        paddingHorizontal: rem(1.2),
        borderRadius: 50,
        textAlign: "center",
        marginRight: rem(1.2)
    },
    acceptButtonText: {
        color: "#000",
        fontSize: rem(1.2),
        fontFamily: "Inter_800ExtraBold",
    },
    rejectButton: {
        marginRight: 1,
    },
    loaderStyle: {
        marginRight: rem(3)
    },
    buttonContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginRight: rem(0.4),
        flexDirection: 'row',
    },
    addedButtonContainer: {
        width: 75,
        justifyContent: "center",
        alignItems: "center",
        height: 30,
        right: 8,
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
    },
    nonMessageContainer: {
        width: "90%",
        marginTop: rem(3),
        borderWidth: 1,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: "center",
        paddingVertical: rem(1),
        paddingHorizontal: rem(2),
    },
    nonMessageText: {
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold",
        textAlign: "center",
        color: "#ff9900",
    },
    unseenIcon: {
        zIndex: 1001,
        position: "absolute",
        right: 10,
        backgroundColor: "yellow",
        width: 13,
        height: 13,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4
    },
});

export default Requests;