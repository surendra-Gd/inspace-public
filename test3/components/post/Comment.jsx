import {Pressable, Text, StyleSheet, View, Vibration} from "react-native";
import React, {memo, useState} from "react";
import {Image} from "expo-image";
import moment from "moment";
import {useRouter} from "expo-router";
import {useSelector} from "react-redux";
import {
    selectUnseenRepliesCountByCommentId
} from "../../service/selectors/appSelectors";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {runOnJS} from "react-native-reanimated";
import CommentDeleteModal from "../modal/CommentDeleteModal";


const Comment = ({currentMemberId, comment, member, dispatch}) => {
    const router = useRouter();
    const [longPressed, setLongPressed] = useState(false);

    const badges = useSelector(state =>
        selectUnseenRepliesCountByCommentId(state, String(comment?.commentId))
    );

    const time = moment(comment?.commentedOn)?.fromNow();


    const handleNavigateToComment = () => {
        router.push({
            pathname: "../comment/[commentId]",
            params: {commentId: comment.commentId},
        });
    };

    const handleLongPressStart = () => {
        if (currentMemberId !== member.memberId) return;
        Vibration.vibrate(100);
        setLongPressed(true);
    };

    const tap = Gesture.LongPress()
        .minDuration(500)
        .onStart(() => {
            runOnJS(handleLongPressStart)();
        })


    return (
        <>
            <GestureDetector gesture={tap}>
                <Pressable onPress={handleNavigateToComment} style={styles.commentContainer}>
                    <View style={styles.profileImageContainer}>
                        <Image source={{uri: member.user.profile}} style={styles.profileImage}/>
                        <View style={member?.userOnline ? styles.online : null}/>
                    </View>
                    <View style={styles.commentSection}>
                        <View style={styles.commentUser}>
                            <Text style={styles.username}>{member?.user?.username}</Text>
                            <Text style={styles.timeText}>{time}</Text>
                        </View>
                        <Text style={[styles.commentText, {backgroundColor: longPressed ? "#ff2020" : null}]}
                              numberOfLines={3}>
                            {comment.payload}
                        </Text>
                        {badges > 0 && (
                            <View style={styles.unseenIcon}>
                                <Text style={styles.unseenIconText}>
                                    {badges}
                                </Text>
                            </View>
                        )}
                        <View style={styles.replyContainer}>
                            <Text style={styles.replyCount}>{comment?.replyCount}</Text>
                            <Text style={styles.replyInput}>Replies</Text>
                        </View>
                    </View>
                </Pressable>
            </GestureDetector>
            {longPressed && (<CommentDeleteModal
                isVisible={longPressed}
                commentId={comment.commentId}
                memberId={currentMemberId}
                postId={comment.postId}
                onClose={() => setLongPressed(false)}
                dispatch={dispatch}
            />)}
        </>
    );
};

const styles = StyleSheet.create({
    commentContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: 13,
        padding: 5,
    },
    commentSection: {
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 3,
        flex: 1
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    postImage: {
        position: "absolute",
        width: 50,
        right: 10,
        borderRadius: 5,
        alignSelf: "center",
        borderWidth: 2,
        borderColor: "#000",
        backgroundColor: "#000"
    },
    button: {
        position: "absolute",
        top: 0,
        right: 0
    },
    buttonIcon: {
        width: 24,
        height: 24,
    },
    commentText: {
        paddingTop: 3,
        color: "#fff",
        fontSize: 13,
        fontFamily: "Inter_500Medium",
    },
    timeText: {
        color: "#6f6f6f",
        fontSize: 11,
        fontFamily: "Inter_600SemiBold",
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
    username: {
        fontSize: 12,
        color: "#dfdfdf",
        fontFamily: "Inter_500Medium"
    },
    commentUser: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    replyContainer: {
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 5,
    },
    replyCount: {
        fontSize: 14,
        color: "#6f6f6f",
        fontFamily: "Inter_700Bold"
    },
    replyInput: {
        fontSize: 13,
        color: "#3c89fb",
        fontFamily: "Inter_500Medium"
    },
    profileImageContainer: {
        marginTop: 5
    },
    unseenIcon: {
        position: "absolute",
        backgroundColor: "yellow",
        width: 19,
        height: 19,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4,
        right: 20
    },
    unseenIconText: {
        borderRadius: 10,
        fontSize: 12,
        textAlign: "center",
        verticalAlign: "middle",
        fontFamily: "Inter_600SemiBold",
        color: "#000"
    },
});

export default memo(Comment);