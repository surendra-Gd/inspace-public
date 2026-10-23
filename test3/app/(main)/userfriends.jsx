import React, { useEffect, useMemo, useState } from 'react';
import {View, Text, FlatList, StyleSheet, ActivityIndicator} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {FRIENDS_ERROR} from "../../service/constants/userConstants";
import {getFriendsAction} from "../../service/actions/userActions";
import UserBanner from "../../components/shared/UserBanner";
import {rem} from "../../utils/uiUtils";


const UserFriends = () => {
    const dispatch = useDispatch();
    const { errors } = useSelector((state) => state.app);

    const [loading, setLoading] = useState(true);
    const { friends, users } = useSelector((state) => state.user);

    const friendsError = errors['friends']?.error === FRIENDS_ERROR || false;

    useEffect(() => {
        dispatch(getFriendsAction()).finally(() => {
            setLoading(false);
        });
    }, [dispatch]);

    const friendList = useMemo(() => {
        if (friendsError) return [];
        return friends?.map((id) => users[id]);
    }, [friends, friendsError, users]);

    if (loading) return <ActivityIndicator size="large" color="#6f6f6f" />;

    return (
        <View style={styles.sectionContainer}>
            {friendsError ? (
                <Text style={styles.errorMessage}>Something went wrong while fetching your friends</Text>
            ) : friends?.length > 0 ? (
                <FlatList data={friendList}
                    keyExtractor={(item) => item.userId.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.friendItem}>
                            <UserBanner user={item} />
                        </View>
                    )}
                    style={styles.friendsList}
                />
            ) : (
                <Text style={styles.noFriendsText}>
                    You haven't connected with any friends yet. Start connecting with others to see them here!
                </Text>
            )}
        </View>

    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        flex: 1,
        padding: rem(0.5),
        backgroundColor: "#000",
        marginTop: rem(7)
    },
    friendsList: {
        paddingTop: rem(1.3)
    },
    friendItem: {
        alignItems: "center",
        paddingLeft: rem(1.5),
        marginBottom: rem(1.9),
    },
    errorMessage: {
        textAlign: 'center',
        marginTop: 20,
        color: '#FF0000',
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
    },
    noFriendsText: {
        textAlign: 'center',
        color: '#d9d9d9',
        fontFamily: "Inter_700Bold",
        marginTop: 20,
    },
});

export default UserFriends;