import React, { useEffect, useMemo, useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image} from 'react-native';
import { useSelector } from 'react-redux';
import { getProfileInfoAction } from '../../service/actions/userActions';
import UnFriendModal from '../modal/UnFriendModal';
import { PROFILE_INFO_ERROR } from '../../service/constants/userConstants';
import ProfileCard from '../shared/ProfileCard';
import ErrorComponent from '../shared/ErrorComponent';
import FriendSpaces from "./FriendSpaces";
import FriendOfFriends from "./FriendsOfFriends";
import {rem} from "../../utils/uiUtils";

const FriendProfile = ({ profile, dispatch }) => {
    const { user, friendsId } = profile;

    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isViewingSpaces, setIsViewingSpaces] = useState(true);

    const { friendsOfFriends, friendSpaces } = useSelector(state => state.user);
    const { errors } = useSelector(state => state.app);

    const profileInfoError = errors[friendsId]?.error === PROFILE_INFO_ERROR || false;

    const option = useMemo(() => {
        const friend = friendsOfFriends[friendsId]?.friends?.length;
        const space = friendSpaces[friendsId]?.spaces?.length;
        return { friend, space };
    }, [friendsOfFriends, friendSpaces, friendsId]);

    useEffect(() => {
        setLoading(true);
        dispatch(getProfileInfoAction(friendsId, user?.userId))
            .finally(() => setLoading(false));
    }, [dispatch, user]);

    return (
        <View style={{paddingBottom: rem(5)}}>
            <View style={styles.container}>
                <ProfileCard user={user} />

                <TouchableOpacity style={styles.unfriendButton}
                    onPress={() => setModalOpen(true)}
                    disabled={modalOpen}
                >
                    <Text style={styles.unfriendButtonText}>UnFriend</Text>
                </TouchableOpacity>


                <View style={styles.navigationMenu}>
                    <TouchableOpacity style={styles.menuOption}
                        onPress={() => setIsViewingSpaces(true)}
                    >
                        <Text style={styles.menuOptionCount}>
                            {loading ? (
                                <ActivityIndicator size="small" color={"#6f6f6f"} />
                            ) : profileInfoError ? (
                                <View>
                                    <Image source={require("../../assets/images/warning.png")} style={styles.errorIcon} resizeMode={"contain"} alt="error" />
                                </View>
                            ) : (
                                option?.space > 9 || option?.space < 1 ? option?.space : `0${option?.space}`
                            )}
                        </Text>
                        <Text style={[styles.menuOptionName,
                            isViewingSpaces && styles.activeOption,
                        ]}
                        >
                            Spaces
                        </Text>
                    </TouchableOpacity>


                    <TouchableOpacity style={styles.menuOption}
                        onPress={() => setIsViewingSpaces(false)}
                    >
                        <Text style={styles.menuOptionCount}>
                            {loading ? (
                                <ActivityIndicator size="small" color={"#6f6f6f"} />
                            ) : profileInfoError ? (
                                <View>
                                    <Image source={require("../../assets/images/warning.png")} style={styles.errorIcon} resizeMode={"contain"} alt="error" />
                                </View>
                            ) : (
                                option?.friend > 9 || option?.friend < 1 ? option?.friend : `0${option?.friend}`
                            )}
                        </Text>
                        <Text style={[
                            styles.menuOptionName,
                            !isViewingSpaces && styles.activeOption,
                        ]}
                        >
                            Friends
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>

            {modalOpen && (
                <UnFriendModal dispatch={dispatch}
                    user={user}
                    friendsId={friendsId}
                    onClose={() => setModalOpen(false)}
                    isVisible={modalOpen}
                />
            )}

            {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
            ) : profileInfoError ? (
                <View style={styles.errorContainer}>
                    <ErrorComponent msg="Something went wrong while getting the profile info." />
                </View>
            ) : isViewingSpaces ? (
                <FriendSpaces friendsId={friendsId} />
            ) : (
                <FriendOfFriends friendsId={friendsId} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: "center",
        width: "90%",
        marginHorizontal: "2%",
        paddingBottom: rem(1),
        paddingHorizontal: rem(0.2),
        borderWidth: 2,
        borderBottomColor: "#1e1e1e"
    },
    unfriendButton: {
        marginTop: rem(2),
        alignSelf: "center",
        backgroundColor: '#fff',
        paddingVertical: rem(0.7),
        width: "75%",
        borderRadius: 10
    },
    unfriendButtonText: {
        color: '#1e1e1e',
        fontSize: rem(1.5),
        textAlign: 'center',
        fontFamily: "Inter_800ExtraBold",
        letterSpacing: rem(0.05)
    },
    navigationMenu: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'space-around',
        marginTop: rem(3),
    },
    menuOption: {
        alignSelf: "center",
        alignItems: 'center',
        gap: 1,
        justifyContent: "center"
    },
    menuOptionCount: {
        color: "#fff",
        fontSize: rem(1.5),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.03)
    },
    optionError: {
        color: "red",
        fontSize: rem(1.7),
    },
    menuOptionName: {
        fontSize: rem(1.5),
        fontFamily: "Inter_500Medium",
        color: '#6F6F6FFF',
        letterSpacing: rem(0.03)
    },
    activeOption: {
        color: "#3083FFFF",
        fontFamily: "Inter_600SemiBold",
    },
    loadingText: {
        textAlign: 'center',
        fontSize: rem(1.5),
        fontFamily: "Inter_700Bold",
        color: '#333',
        marginTop: rem(1)
    },
    errorIcon: {
        width: 23,
        height: 23
    },
    errorContainer: {
        marginTop: rem(2)
    }
});

export default FriendProfile;