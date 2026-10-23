import React, { useEffect, useState } from 'react';
import {View, Text, Image, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getActivityAction } from '../../service/actions/spaceActions';
import { getActivities } from '../../service/selectors/spaceSelectors';
import {rem} from "../../utils/uiUtils";


const Activities = ({ spaceId, isAdmin }) => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const activities = useSelector(state => getActivities(state, spaceId)) || {};
    const { page, body } = activities;

    const fetchActivities = async () => {
        if (!page || (page?.hasNext && !loading)) {
            setLoading(true);
            const fetchPage = page ? page.currentPage + 1 : 0;
            await dispatch(getActivityAction(fetchPage, spaceId));
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [page, dispatch, spaceId]);

    const renderActivity = ({ item, index }) => (
        <View style={styles.activityItem} key={index}>
            <View style={styles.userContainer}>
                <Image source={{ uri: item.user?.profile }}
                    style={styles.userImage}
                />
                <View style={styles.userDetails}>
                    <Text style={styles.username}>{item.user?.username}</Text>
                    <Text style={styles.name}>{item.user?.name}</Text>
                </View>
            </View>
            <View style={styles.messageContainer}>
                <Text style={[
                    styles.message,
                    item.prompt === 'JOINED' && styles.joinedMessage,
                    item.prompt === 'LEFT' && styles.leftMessage,
                    item.prompt === 'REMOVE' && styles.removedMessage,
                ]}>
                    {item.prompt === 'JOINED' ? "Joined" :
                        item.prompt === 'LEFT' ? "Left" :
                            item.prompt === 'REMOVE' && "Removed"}
                </Text>
            </View>
        </View>
    );


    return (
        <View style={styles.container}>
            <FlatList style={isAdmin ? styles.activities : { paddingVertical: rem(1.5) }}
                data={body}
                renderItem={renderActivity}
                keyExtractor={(item, index) => index.toString()}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={() => (!loading && <Text style={styles.emptyActivities}>Looks like there are no activities here.</Text>)}
                onEndReached={() => {
                    fetchActivities();
                }}
                ListFooterComponent={() => (
                    <View style={{paddingVertical: 30}}></View>
                )}
            />
            {loading && (
                <ActivityIndicator color={"#6f6f6f"} size={"small"}  style={styles.postLoading}/>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: rem(1),
    },
    activities: {
        paddingVertical: rem(6)
    },
    activityItem: {
        alignItems: "center",
        gap: rem(1),
        flexDirection: 'row',
        marginBottom: rem(3),
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
        fontSize: rem(1.3),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.01),
        color: "#6F6F6FFF"
    },
    username: {
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold",
        color: '#fff',
        letterSpacing: rem(0.06)
    },
    messageContainer: {
        marginRight: rem(1)
    },
    message: {
        width: 80,
        height: 22,
        textAlignVertical:"center",
        textAlign: "center",
        fontSize: rem(1.2),
        fontFamily: "Inter_700Bold",
        textTransform: "uppercase",
        letterSpacing: rem(0.02),
        borderRadius: 4,
    },
    joinedMessage: {
        backgroundColor: "rgba(101, 204, 101, 0.55)",
        color: "#00FF00"
    },
    leftMessage: {
        backgroundColor: "rgba(81, 136, 239, 0.66)",
        color: '#18bce1',
    },
    removedMessage: {
        backgroundColor: "rgba(204, 101, 101, 0.55)",
        color: '#FF0000',
    },
    loadingContainer: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    postLoading: {
        marginVertical: rem(3),
        alignSelf: "center"
    },
    emptyActivities: {
        color: "#6f6f6f",
        fontFamily: "Inter_600SemiBold",
        textAlign: "center",
        marginTop: rem(2),
    }
});

export default Activities;