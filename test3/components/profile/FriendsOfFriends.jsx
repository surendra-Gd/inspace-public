import React, { useMemo } from 'react';
import {View, Text, StyleSheet, FlatList, Image} from 'react-native';
import { useSelector } from 'react-redux';
import UserBanner from '../shared/UserBanner';
import {rem} from "../../utils/uiUtils";


const FriendOfFriends = ({friendsId}) => {
    const { friendsOfFriends, userData, users } = useSelector(state => state.user);
    const currentId = userData?.userId;

    const friends = useMemo(() => {
        const userIds = friendsOfFriends[friendsId]?.friends;
        return userIds?.map(id => users[id]);
    }, [friendsOfFriends, users]);

    return (
        <View style={styles.sectionContainer}>
            <View style={styles.headingContainer}>
                <Text style={styles.headingText}>Friends</Text>
                <Image source={require("../../assets/images/chevron.png")} style={styles.headingIcon} />
            </View>

            <View style={styles.listContainer}>
                <FlatList data={friends}
                    keyExtractor={(item) => item.userId.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.friendItem}>
                            <UserBanner user={item} currentId={currentId} />
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.noFriendsText}>
                            No friends found. Encourage your friend to connect with others! Think this will never happen
                        </Text>
                    }
                    nestedScrollEnabled={true}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        padding: rem(0.5),
        marginTop: rem(2.5)
    },
    headingContainer: {
        marginLeft: rem(1.5),
        flexDirection: 'row',
        alignItems: "center",
        gap: 6
    },
    headingText: {
        color: "#fff",
        fontSize: rem(2.2),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.04)
    },
    headingIcon: {
        top: rem(0.2),
        width: 20,
        height: 20,
    },
    listContainer: {
        marginVertical: rem(2),
    },
    friendItem: {
        paddingLeft: rem(1),
        marginBottom: rem(2.2)
    },
    noFriendsText: {
        fontFamily: "Inter_600SemiBold",
        textAlign: 'center',
        color: '#888',
        marginTop: 20,
    },
});

export default FriendOfFriends;