import {useLocalSearchParams, useRouter} from "expo-router";
import {Text, View, StyleSheet, FlatList, Pressable, ActivityIndicator, TouchableOpacity} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import {
    getCurrentSpace,
    selectCommentByCommentId,
    selectRepliesByCommentId,
    selectSpaceMembersObj
} from "../../../../../service/selectors/spaceSelectors";
import {rem} from "../../../../../utils/uiUtils";
import {Image} from "expo-image";
import moment from "moment/moment";
import React, {useEffect, useState, Fragment} from "react";
import {getCommentRepliesAction} from "../../../../../service/actions/postActions";
import {PostCommentInput} from "../../../../../components/post/PostCommentInput";
import {Reply} from "../../../../../components/post/Reply";
import {selectIsErrorExists, selectUnseenRepliesCountByCommentId} from "../../../../../service/selectors/appSelectors";
import {REMOVE_UNSEEN_ITEM} from "../../../../../service/constants/appConstants";

export default function PostComment() {
    const {commentId} = useLocalSearchParams();
    const dispatch = useDispatch();
    const router = useRouter();

    const [prefix, setPrefix] = useState("");
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const {currentMember, spaceId} = useSelector(getCurrentSpace);
    const members = useSelector(selectSpaceMembersObj);

    const comment = useSelector(state =>
        selectCommentByCommentId(state, commentId));

    const member = members[String(comment?.memberId)] || null;

    const replies = useSelector(state =>
        selectRepliesByCommentId(state, Number(commentId)));

    const repliesError = useSelector(state =>
        selectIsErrorExists(state, commentId, "GET_COMMENT_REPLIES_ERROR"));


    const badges = useSelector(state =>
        selectUnseenRepliesCountByCommentId(state, String(commentId))
    );


    const time = moment(comment?.commentedOn)?.fromNow();
    const page = comment?.repliesPage;

    const toggleText = () => {
        setIsExpanded(!isExpanded);
    };

    const fetchReplies = () => {
        if (repliesError || !comment.replyCount) return;
        if (!page || (page?.hasNext && !loading)) {
            setLoading(true);
            const fetchPage = page ? page.currentPage + 1 : 0;
            dispatch(getCommentRepliesAction(fetchPage, commentId));
            setLoading(false);
        }
    };

    useEffect(() => {
        if (badges > 0) {
            dispatch({
                type: REMOVE_UNSEEN_ITEM,
                payload: {spaceId, itemId: commentId, itemType: "unseenCommentReplies"}
            });
        }
    }, [badges, commentId]);

    useEffect(() => {
        if (page) return;
        fetchReplies();
    }, [page, dispatch, commentId]);

    const handleNavigation = (memberId) => {
        if (currentMember.memberId === memberId) {
            router.push("../yourpage")
        } else {
            router.push({
                pathname: "../member/[memberId]",
                params: {memberId}
            })
        }
    }


    if (!member) return null;

    if (!page && loading) {
        return (
            <Text style={styles.repliesLoading}>
                {"Replies loading... almost there! 🕒✨"}
            </Text>
        )
    }


    return (
        <Fragment>
            {comment && (
                <View style={styles.container}>
                    <View style={styles.commentContainer}>
                        <TouchableOpacity style={styles.profileImageContainer}
                            onPress={() => handleNavigation(member.memberId)}
                        >
                            <Image source={{uri: member.user.profile}} style={styles.profileImage}/>
                            <View style={member?.userOnline ? styles.online : null}/>
                        </TouchableOpacity>
                        <View style={styles.commentSection}>
                            <View style={styles.commentUser}>
                                <Text style={styles.username}>{member?.user?.username}</Text>
                                <Text style={styles.timeText}>{time}</Text>
                            </View>
                            <Pressable onPress={toggleText}>
                                <Text style={styles.commentText}
                                      numberOfLines={isExpanded ? 0 : 3}
                                >
                                    {comment.payload}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {repliesError ? (
                            <View style={{flex: 1}}>
                                <Text style={styles.repliesError}>
                                    Error! 🚨 Replies didn’t load, try again!
                                </Text>
                            </View>
                        ) :
                        (<View style={styles.repliesSection}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={replies}
                                onEndReached={fetchReplies}
                                onEndReachedThreshold={0.5}
                                inverted
                                renderItem={({item: reply}) => {
                                    const member = members[reply.memberId];
                                    return member && (
                                        <View style={{marginBottom: 12}}>
                                            <Reply
                                                key={reply.commentId}
                                                dispatch={dispatch}
                                                currentMemberId={currentMember.memberId}
                                                member={member}
                                                reply={reply}
                                                setPrefix={setPrefix}
                                                router={router}
                                            />
                                        </View>
                                    );
                                }}
                                ListEmptyComponent={
                                    <View style={{flex: 1}}>
                                        <Text style={styles.noReplies}>
                                            No replies yet—be the first to say something! 🗣️✨
                                        </Text>
                                    </View>
                                }
                                ListFooterComponent={loading ? (<ActivityIndicator size={22} color={"#fff"} /> ) : null}
                            />

                        </View>)}

                </View>
            )}

            {!repliesError && (
                <PostCommentInput
                    postId={comment?.postId}
                    parentId={commentId}
                    memberId={currentMember?.memberId}
                    dispatch={dispatch}
                    setPrefix={setPrefix}
                    prefix={prefix}
                />
            )}
        </Fragment>
    )

}

const styles = StyleSheet.create({
    container: {
        top: rem(6.5),
        flex: 1,
    },
    commentContainer: {
        flexDirection: "row",
        gap: 13,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderBottomWidth: 1,
        borderColor: "#1e1e1e",
        alignSelf: "center",
        borderRadius: 10
    },
    commentSection: {
        justifyContent: "center",
        flexDirection: "column",
        gap: 8,
        flex: 1,
    },
    profileImage: {
        width: 55,
        height: 55,
        borderRadius: 50,
    },
    button: {
        position: "absolute",
        top: 20,
        zIndex: 1001,
        right: 30
    },
    buttonIcon: {
        width: 20,
        height: 20,
    },
    commentText: {
        color: "#000",
        fontSize: 13.5,
        fontFamily: "Inter_600SemiBold",
        backgroundColor: "#dfdfdf",
        alignSelf: "flex-start",
        borderBottomWidth: 1,
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 5
    },
    timeText: {
        color: "#6f6f6f",
        fontSize: 11,
        fontFamily: "Inter_600SemiBold",
    },
    repliesSection: {
        paddingTop: 15,
        paddingBottom: 170,
        gap: 12,
        paddingLeft: 15
    },
    profileImageContainer: {
        marginTop: 5,
        alignSelf: "flex-start"
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
        fontSize: 13,
        color: "#fff",
        fontFamily: "Inter_400Regular",
        letterSpacing: 0.1
    },
    commentUser: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    noReplies: {
        alignSelf: "center",
        color: "#fff",
        textAlign: "center",
        marginTop: "50%",
        fontFamily: "Inter_600SemiBold"
    },
    repliesError: {
        fontSize: 14,
        color: "rgba(255,204,0,0.95)",
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: 10,
        textAlign: "center",
        marginTop: "70%"
    },
    repliesLoading: {
        top: "30%",
        alignSelf: "center",
        color: "#fff",
        fontFamily: "Inter_600SemiBold",
        fontSize: 15,
        paddingHorizontal: 30,
        textAlign: "center"
    }
})