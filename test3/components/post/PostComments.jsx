import {FlatList, StyleSheet, Text, View} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import {selectCommentsByPostId} from "../../service/selectors/spaceSelectors";
import React, {useCallback, useEffect, useState} from "react";
import Comment from "./Comment";
import {getPostCommentsAction} from "../../service/actions/postActions";
import {selectIsErrorExists, selectUnseenCommentsCountByPostId} from "../../service/selectors/appSelectors";
import {REMOVE_UNSEEN_ITEM} from "../../service/constants/appConstants";

export const PostComments = ({post, currentMemberId, members}) => {
    const comments = useSelector((state) => selectCommentsByPostId(state, post.postId));
    const dispatch = useDispatch();
    const page = post?.commentsPage || null;
    const [loading, setLoading] = useState(false);

    const postId = post?.postId;

    const commentBadge = useSelector(state =>
        selectUnseenCommentsCountByPostId(state, postId)
    );

    const commentError = useSelector(state =>
        selectIsErrorExists(state, postId, "POST_COMMENTS_ERROR")
    );

    const fetchComments = useCallback(async () => {
        if (commentError) return;
        if (!page || (page?.hasNext && !loading)) {
            setLoading(true);
            try {
                const fetchPage = page ? page?.currentPage + 1 : 0;
                await dispatch(getPostCommentsAction(fetchPage, post.postId));
            } catch (error) {
                console.error("Error fetching comments:", error);
            } finally {
                setLoading(false);
            }
        }
    }, [page, loading, dispatch, commentError]);



    useEffect(() => {
        if (comments?.length === 0) {
            fetchComments();
        }
    }, [fetchComments, comments.length]);

    useEffect(() => {
        if (commentBadge > 0) {
            dispatch({
                type: REMOVE_UNSEEN_ITEM,
                payload: {
                    spaceId: post?.spaceId,
                    itemId: postId,
                    itemType: "unseenPostComments"
                }
            });
        }
    }, [commentBadge, post]);

    const renderComment = ({item: comment}) => {
        const member = members?.[comment.memberId] || null;
        if(!member) return;

        return (
            <View style={{marginBottom: 20}}>
                <Comment
                    currentMemberId={currentMemberId}
                    member={member}
                    comment={comment}
                    key={comment.commentId}
                    dispatch={dispatch}
                />
            </View>
        );
    };

    if(commentError) {
        return (
            <Text style={styles.commentsError}>
                {"Oops! 🚨 Comments didn’t load. \nTry again later!"}
            </Text>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.subHeader}>
                <Text style={styles.reactions}>Reactions: </Text>
                {commentBadge > 0 && (
                    <View style={styles.unseenIcon}>
                        <Text style={styles.unseenIconText}>
                            {commentBadge}
                        </Text>
                    </View>
                )}
            </View>
            {comments?.length > 0 ? (
                <FlatList
                    data={comments}
                    renderItem={renderComment}
                    keyExtractor={(item) => item.commentId.toString()}
                    onEndReached={fetchComments}
                    onEndReachedThreshold={0.1}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                No comments yet 🙃. Don’t leave this post hanging—say something! 💬✨
                            </Text>
                        </View>
                    }
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        No comments yet 🙃. Don’t leave this post hanging—say something! 💬✨
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 15,
        width: "95%",
    },
    input: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        backgroundColor: "#1e1e1e",
        borderRadius: 10,
        color: "#fff",
        flex: 1,
        marginLeft: 15,
    },
    button: {
        padding: 10,
    },
    scrollContainer: {
        padding: 10,
        flexGrow: 1,
    },
    comment: {
        marginBottom: 10,
        backgroundColor: "#6f6f6f",
        padding: 10,
        borderRadius: 5,
    },
    emptyContainer: {
        flex: 1,
        marginTop: 30,
        alignSelf: "center",
        marginHorizontal: 20
    },
    emptyText: {
        color: "#6f6f6f",
        fontSize: 13,
        fontFamily: "Inter_600SemiBold",
        textAlign: "center"
    },
    container: {
        marginVertical: 10,
        paddingHorizontal: 5,
        flex: 1,
        gap: 15
    },
    reactions: {
        fontSize: 17,
        fontFamily: "Inter_600SemiBold",
        color: "#6f6f6f",
        letterSpacing: 0.5,
    },
    unseenIcon: {
        backgroundColor: "#fff",
        width: 20,
        height: 20,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4
    },
    unseenIconText: {
        borderRadius: 10,
        fontSize: 12,
        textAlign: "center",
        verticalAlign: "middle",
        fontFamily: "Inter_600SemiBold",
        color: "#000"
    },
    subHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingLeft: 10,
    },
    commentsError: {
        fontSize: 14,
        color: "rgba(255,0,0,0.91)",
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: 10,
        textAlign: "center",
        marginTop: 30
    }
});


/*
<View style={styles.inputContainer}>
    <TextInput
        style={styles.input}
        placeholder="Something..."
        value={values.comment}
        onChangeText={handleChange("comment")}
        onBlur={handleBlur("comment")}
        placeholderTextColor={"#fff"}
        onSubmitEditing={() => handleSubmit()}
    />
    <TouchableOpacity onPress={() => handleSubmit()} style={styles.button}>
        {isSubmitting ? (
            <ActivityIndicator color={"#fff"} size={20} style={{ padding: 10 }} />
        ) : (
            <Image source={require("../../assets/images/right.png")} style={{ width: 18, height: 18 }} />
        )}
    </TouchableOpacity>
</View>*/


/*const onSubmit = async (values, actions) => {
    if (!values.comment) return;
    const request = {
        postId: postId,
        parentId: 0,
        payload: values.comment,
        commentType: "COMMENT",
        repliesCount: 0
    };
    try {
        const { data } = await SPACE_API.post("/comments/add", request);
        await dispatch(addCommentAction({ ...request, id: data.id, memberId: currentMemberId,  commentedOn: data.commentedOn}));
        Toast.show({ type: "success", text1: "Comment Added." });
        actions.resetForm();
    } catch (error) {
        Toast.show({ type: "error", text1: error?.response?.data?.message || "Unexpected error occurred" });
    } finally {
        actions.setSubmitting(false);
    }
};

const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
} = useFormik({
    initialValues: {
        comment: "",
    },
    enableReinitialize: true,
    validationSchema: commentSchema,
    onSubmit,
});*/