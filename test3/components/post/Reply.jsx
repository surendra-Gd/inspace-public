import {ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React, {useState} from "react";
import {Image} from "expo-image";
import moment from "moment";
import {SEND_MESSAGE} from "../../service/constants/stompConstants";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Animated, {useAnimatedStyle, useSharedValue, withSpring, withTiming} from "react-native-reanimated";


export const Reply = (
    {dispatch, reply, currentMemberId, member, setPrefix, router}
) => {
    const [loading, setLoading] = useState(false);
    const translateX = useSharedValue(0);
    const time = moment(reply?.commentedOn)?.fromNow();

    const isCurrenMemberReply = currentMemberId === member?.memberId;

    const handleReplyDeletion = () => {
        setLoading(true);
        const message = {
            "commentId": reply.commentId,
            "memberId": currentMemberId,
            "parentId": reply.parentId
        }
        let channel = "/comment.deleteReply";
        dispatch({type: SEND_MESSAGE, payload: {channel, message}})
        setLoading(false);
    }

    const handleNavigation = (memberId) => {
        if (currentMemberId === memberId) {
            router.push("../yourpage")
        } else {
            router.push({
                pathname: "../member/[memberId]",
                params: {memberId}
            })
        }
    }

    const swipeGesture = Gesture.Pan()
        .enabled(isCurrenMemberReply)
        .activateAfterLongPress(100)
        .onUpdate((event) => {
            if (event.translationX >= 0) return;
            translateX.value = event.translationX;
        })
        .onEnd((event) => {
            if (event.translationX < -100) {
                translateX.value = withTiming(-100, {duration: 300});
            } else {
                translateX.value = withTiming(0, {duration: 300});
            }
        });


    const swipeStyle = useAnimatedStyle(() => {
        return {
            transform: [{translateX: translateX.value}],
        };
    });

    const deleteStyle = useAnimatedStyle(() => {
        return {
            opacity: translateX.value <= -100 ? 1 : 0,
            display: translateX.value <= -100 ? "flex" : "none"
        };
    });

    return (
        <GestureDetector gesture={swipeGesture}>
            <View style={styles.container}>
                <Animated.View style={[styles.replyContainer, swipeStyle]}>
                    <TouchableOpacity onPress={() => handleNavigation(member.memberId)} style={styles.profileImageContainer}>
                        <Image source={{uri: member.user.profile}} style={styles.profileImage}/>
                        <View style={member?.userOnline ? styles.online : null}/>
                    </TouchableOpacity>
                    <View style={styles.commentSection}>
                        <View style={styles.commentUser}>
                            <Text style={styles.username}>{member?.user?.username}</Text>
                            <Text style={styles.timeText}>{time}</Text>
                        </View>
                        {reply?.prefixes && (
                            <Pressable onPress={() => {
                            }} style={styles.prefixContainer}>
                                <Text style={styles.prefixText}>
                                    @Reply
                                    To {reply?.prefixes === member?.user?.username ? "YourSelf" : reply?.prefixes}
                                </Text>
                            </Pressable>
                        )}
                        <Text style={styles.commentText}>
                            {reply.payload}
                        </Text>
                        <Pressable style={styles.reply} onPress={() => setPrefix(member?.user?.username)}>
                            <Text style={styles.replyInput}>Reply</Text>
                        </Pressable>
                    </View>
                </Animated.View>

                <Animated.View style={[styles.deleteButton, deleteStyle]}>
                    {loading ? (
                        <ActivityIndicator size={16} color={"#fff"}/>
                    ) : (
                        <TouchableOpacity style={styles.deleteContainer} onPress={() => {
                            handleReplyDeletion();
                            translateX.value = withSpring(0);
                        }}>
                            <Image source={require("../../assets/images/delete (5).png")}
                                   style={styles.deleteIcon}/>
                            <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>

            </View>
        </GestureDetector>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    replyContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: 13,
        padding: 5,
    },
    profileImageContainer: {
        marginTop: 5
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    online: {
        width: 15,
        height: 15,
        backgroundColor: "#4CAF50",
        borderRadius: 50,
        position: "absolute",
        bottom: 0,
        right: 0
    },
    commentSection: {
        justifyContent: "center",
        flexDirection: "column",
        gap: 2,
        flex: 1,
    },
    commentUser: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    username: {
        fontSize: 13,
        color: "#fff",
        fontFamily: "Inter_400Regular",
        letterSpacing: 0.1
    },
    timeText: {
        color: "#6f6f6f",
        fontSize: 11,
        fontFamily: "Inter_600SemiBold",
    },
    commentText: {
        paddingTop: 3,
        color: "#fff",
        fontSize: 13,
        fontFamily: "Inter_500Medium",
    },
    reply: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    replyInput: {
        fontSize: 13,
        color: "#6f6f6f",
        fontFamily: "Inter_600SemiBold"
    },
    deleteButton: {
        position: "absolute",
        right: 0,
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        height: "100%",
        borderRadius: 10
    },
    deleteContainer: {
        backgroundColor: "red",
        padding: 10,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    prefixText: {
        fontFamily: "Inter_600SemiBold",
        fontSize: 13,
        color: "#3c89fb"
    },
    deleteIcon: {
        width: 20,
        height: 20
    },
    deleteText: {
        color: "#fff",
        fontSize: 15,
        fontFamily: "Inter_600SemiBold"
    },
});