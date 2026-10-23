import {getCommentReplies, getPost, getPostComments, getPostResponses} from "../api/postAPI";
import {setError} from "./appActions";
import {
    GET_COMMENT_REPLIES_ERROR, GET_POST_ERROR, POST_COMMENTS_ERROR, POST_RESPONSE_ERROR, SET_POST,
    SET_POST_COMMENT_REPLIES, SET_POST_COMMENTS, SET_POST_RESPONSES
} from "../constants/spaceConstants";
import Toast from "react-native-toast-message";


export const getPostAction = (postId) => async (dispatch) => {
    try {
        const {error, data} = await getPost(postId);
        if (error) {
            dispatch(setError(postId, GET_POST_ERROR));
            return;
        }
        dispatch({
            type: SET_POST,
            payload: data,
            meta: {
                requiresAuth: true
            }
        });
    } catch (error) {
        dispatch(setError(postId, GET_POST_ERROR));
    }
};

export const getPostResponseAction = (postId) => async (dispatch, getState) => {
    const {posts} = getState().post;
    if(posts[postId]?.isPostResponseFetched) return;
    try {
        const {error, data} = await getPostResponses(postId);
        if(error) {
            dispatch(setError(postId, POST_RESPONSE_ERROR));
            return;
        }
        let { content, currentPage, totalElements, totalPages, first, last, hasNext, hasPrevious } = data.comments;

        dispatch({
            type: SET_POST_RESPONSES,
            payload: {
                emojis: data.emojis,
                comments: content,
                postId,
                page: {
                    currentPage,
                    totalElements,
                    totalPages,
                    first,
                    last,
                    hasNext,
                    hasPrevious
                }
            }
        })
    } catch (error) {
        dispatch(setError(postId, POST_RESPONSE_ERROR))
    }
}


export const getCommentRepliesAction = (fetchPage, commentId) => async (dispatch, getState) => {
    const comment = getState().post.comments[commentId];
    const page = comment?.repliesPage;

    if (page && fetchPage === page.totalPages) return;

    try {
        const {error, data} = await getCommentReplies(commentId, fetchPage);
        if (error) {
            dispatch(setError(commentId, GET_COMMENT_REPLIES_ERROR, error));
            return;
        }
        let {content, currentPage, totalElements, totalPages, first, last, hasNext, hasPrevious} = data;

        dispatch({
            type: SET_POST_COMMENT_REPLIES,
            payload: {
                page: {
                    currentPage,
                    totalElements,
                    totalPages,
                    first,
                    last,
                    hasNext,
                    hasPrevious
                },
                commentId: commentId,
                replies: content
            }
        });
    } catch (err) {
        Toast.show({type: "error", text1: "Something went wrong. Please try again later."});
    }
}


export const getPostCommentsAction = (fetchPage, postId) => async (dispatch, getState) => {
    const post = getState().post.posts[postId];
    const page = post?.commentsPage;

    if (page && fetchPage === page.totalPages) return;
    try {
        const {error, data} = await getPostComments(postId, fetchPage);
        if (error) {
            dispatch(setError(postId, POST_COMMENTS_ERROR, error));
            return;
        }
        let { content, currentPage, totalElements, totalPages, first, last, hasNext, hasPrevious } = data;

        dispatch({
            type: SET_POST_COMMENTS,
            payload: {
                page: {
                    currentPage,
                    totalElements,
                    totalPages,
                    first,
                    last,
                    hasNext,
                    hasPrevious
                },
                postId: postId,
                comments: content
            }
        });
    } catch (err) {
        Toast.show({type: "error", text1:"Something went wrong. Please try again later."});
    }
}