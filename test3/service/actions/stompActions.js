import {SUBSCRIBE_CHANNEL} from "../constants/stompConstants";
import {
    ADD_TEXT,
    ADD_TEXT_MESSAGE,
    LIKE_TEXT_UPDATE,
    UPDATE_MEMBER_ONLINE_STATUS,
    UNLIKE_TEXT_UPDATE,
    REMOVE_TEXT,
    DELETE_TEXT_MESSAGE,
    UPDATE_STREAK,
    ADD_POST_COMMENT,
    DELETE_POST_COMMENT,
    ADD_REPLY,
    REMOVE_REPLY, REMOVE_POST,
    GET_POST_ERROR
} from "../constants/spaceConstants";
import {Vibration} from "react-native";
import {removeActionLoading, setError} from "./appActions";
import {ADD_TEXT_LOADING, INCREMENT_UNSEEN_ITEM} from "../constants/appConstants";
import Toast from "react-native-toast-message";
import {selectCurrentUserId} from "../selectors/userSelector";
import {selectCommentByCommentId, selectCurrentMemberId} from "../selectors/spaceSelectors";
import {selectFinalPath} from "../selectors/appSelectors";
import {setCurrentSpaceIdAction} from "./spaceActions";


// Helper functions
// Todo: 🚩
const handleSpaceChannels = (dispatch, message) => {
    if (!message?.channels?.length) return;
    message.channels.forEach((channel) => {
        dispatch({type: SUBSCRIBE_CHANNEL, payload: channel});
    });
};

// Todo: 🚩
const handleUserStatus = (dispatch, message, getState) => {
    const {status, userId, profileUrl, username} = message;
    const currentUserId = selectCurrentUserId(getState());
    if (currentUserId === userId) return;
    dispatch({
        type: UPDATE_MEMBER_ONLINE_STATUS,
        payload: {status, userId},
    });
    // Add a timeout to delay the toast
    setTimeout(() => {
        Toast.show({
            type: "status",
            text1: username,
            props: {
                isOnline: status === "ONLINE",
                profile: profileUrl,
                key: `${userId}${status}`,
            },
            autoHide: false,
        });
    }, 300); // Adjust the delay as needed
};

/* {
    "action": "TEXT",
    "payload": {
        "anonymous": false, "createdOn": "2025-01-11T17:50:52.2806859",
        "lastUpdatedOn": "2025-01-11T17:50:52.2806859", "liked": false,
        "likesCount": 0, "memberId": 27, "messagesCount": 0, "spaceId": 3,
        "tagged": [], "text": "Check ✅ loading again ", "textId": 78
        },
    "streak": 0,
    "username: "iamsurendra",
    "profile": "aws/profile.png",
    "userId": 7
} */
// Todo: 🚩
const handleAddText = (dispatch, message, getState) => {
    const {payload, streak, profile, userId} = message;

    // Get current user ID
    const currentUserId = selectCurrentUserId(getState());
    const isCurrentUser = currentUserId === userId;

    // Remove loading indicator if current user is the one adding the text
    if (isCurrentUser) {
        dispatch(removeActionLoading(payload.spaceId, ADD_TEXT_LOADING));
    }

    // Show streak notification if there is a streak
    if (streak > 0 && isCurrentUser) {
        Toast.show({
            type: "streak",
            props: {
                streakCount: streak,
                profileUri: profile
            },
        })

        // Dispatch the update streak action
        dispatch({
            type: UPDATE_STREAK,
            payload: {memberId: payload.memberId, streak},
        });
    }

    // Add the text to the store
    dispatch({type: ADD_TEXT, payload});
};

// Todo: 🚩
const handleLikeText = (dispatch, message, getState) => {
    // Todo: This will used in main function level
    if (!message?.payload) return;

    const {payload} = message;
    const {spaceId} = payload;

    // Get the current member ID
    const currentMemberId = selectCurrentMemberId(getState(), String(spaceId));

    // Dispatch the LIKE_TEXT_UPDATE action
    dispatch({
        type: LIKE_TEXT_UPDATE,
        payload: {
            ...payload,
            currentMemberId,
        },
    });
};

// Todo: 🚩
const handleUnlikeText = (dispatch, message, getState) => {
    // Todo: This will used in main function level
    if (!message?.payload) return;

    const {payload} = message;
    const {spaceId} = payload;

    // Get the current member ID
    const currentMemberId = selectCurrentMemberId(getState(), String(spaceId));

    // Dispatch the UNLIKE_TEXT_UPDATE action
    dispatch({
        type: UNLIKE_TEXT_UPDATE,
        payload: {
            ...payload,
            currentMemberId,
        },
    });
};

// Todo: 🚩
const handleDeleteText = (dispatch, message, getState) => {
    const {textId} = message;
    const finalPath = selectFinalPath(getState());
    dispatch({type: REMOVE_TEXT, payload: {textId}});
    if (finalPath === `/text/${textId}`) {
        Toast.show({
            type: "error",
            text1: "Text is deleted now 🚫—say goodbye!"
        })
    }
};

// Todo: 🚩
const handleAddTextMessage = (dispatch, message, getState) => {
    if (!message) return;

    const {profile, text, payload} = message;
    const {textId, spaceId} = payload;

    dispatch({type: ADD_TEXT_MESSAGE, payload: payload});
    const finalPath = selectFinalPath(getState());


    const handleNavigateToText = async (router) => {
        try {
            Toast.hide();
            await dispatch(setCurrentSpaceIdAction(spaceId));
        } finally {
            router.replace({
                pathname: "/space/[spaceid]/text/[textId]",
                params: {spaceid: spaceId, textId: textId}
            })
        }
    }

    if (finalPath === `/text/${textId}`) {
        Vibration.vibrate(100);
    } else {
        Toast.show({
            type: "message",
            text2: payload?.message,
            props: {
                onClick: handleNavigateToText,
                profile: profile,
                text: text
            },
            autoHide: true,
        })
        dispatch({
            type: INCREMENT_UNSEEN_ITEM,
            payload: {
                spaceId,
                itemId: textId,
                itemType: "unseenTextMessages"
            }
        });
    }
};

// Todo: 🚩
const handleRemoveTextMessage = (dispatch, message) => {
    const {messageId, textId} = message;
    dispatch({
        type: DELETE_TEXT_MESSAGE,
        payload: {messageId, textId},
    });
};

// Todo: 🚩
const handleAddPostComment = (dispatch, message, getState) => {
    if (!message || !message.payload) return;

    const {postId, spaceId, memberId} = message?.payload;
    const finalPath = selectFinalPath(getState());

    const currentMemberId = selectCurrentMemberId(getState(), String(spaceId));
    const isCurrentUser = currentMemberId === memberId;

    const handleNavigateToPost = async (router) => {
        try {
            Toast.hide();
            await dispatch(setCurrentSpaceIdAction(spaceId));
        } finally {
            router.replace({
                pathname: "/space/[spaceid]/post/[postIds]",
                params: {spaceid: spaceId, postIds: [postId]},
            });
        }
    };

    const showToast = () => {
        Toast.show({
            type: "comment",
            props: {
                onClick: handleNavigateToPost,
                comment: message.payload.payload,
                profile: message?.profile,
                username: message?.username,
                post: message?.post
            },
            autoHide: true,
        });
    };


    dispatch({type: ADD_POST_COMMENT, payload: message?.payload});
    if(isCurrentUser) return;

    dispatch({
        type: INCREMENT_UNSEEN_ITEM,
        payload: {spaceId, itemId: postId, itemType: "unseenPostComments"},
    });


    if (finalPath.startsWith("/post/")) {
        const postIds = decodeURIComponent(finalPath.slice(6))
            .split(", ")
            .map((id) => id.trim());

        if (!postIds.includes(String(postId))) {
            showToast();
        } else {
            Vibration.vibrate(100);
        }
    } else {
        showToast();
    }

}

// Todo: 🚩
const handleRemovePostComment = (dispatch, message, getState) => {
    const {commentId} = message;

    const finalPath = selectFinalPath(getState());
    dispatch({type: DELETE_POST_COMMENT, payload: commentId});
    if (finalPath === `/comment/${commentId}`) {
        Vibration.vibrate(100);
        Toast.show({
            type: "error",
            text1: "Comment’s deleted 🚫—off it goes from this chat!"
        })
    }
}

// Todo: 🚩
const handleAddCommentReply = (dispatch, message, getState) => {
    if (!message || !message.payload) return;

    const {parentId, spaceId, postId, memberId} = message.payload;
    const finalPath = selectFinalPath(getState());

    const currentMemberId = selectCurrentMemberId(getState(), String(spaceId));
    const isCurrentUser = currentMemberId === memberId;

    const handleNavigateToPost = async (router) => {
        try {
            Toast.hide();
            await dispatch(setCurrentSpaceIdAction(spaceId));
        } finally {
            router.replace({
                pathname: "/space/[spaceid]/post/[postIds]",
                params: {spaceid: spaceId, postIds: [postId]},
            });
        }
    };

    const showToast = () => {
        Toast.show({
            type: "reply",
            props: {
                onClick: handleNavigateToPost,
                reply: message.payload.payload,
                comment: message?.comment,
                username: message?.username,
                profile: message?.profile
            },
            autoHide: true,
        });
    };

    const incrementUnseenReplies = () => {
        dispatch({
            type: INCREMENT_UNSEEN_ITEM,
            payload: {spaceId, itemId: parentId, itemType: "unseenCommentReplies"},
        });
    };

    // Add the reply
    dispatch({type: ADD_REPLY, payload: message.payload});


    if(isCurrentUser) return;

    if (finalPath.startsWith("/post/")) {
        incrementUnseenReplies();

        const postIds = decodeURIComponent(finalPath.slice(6))
            .split(", ")
            .map((id) => id.trim());

        if (!postIds.includes(String(postId))) {
            showToast();
        }
    } else if (finalPath === `/comment/${parentId}`) {
        Vibration.vibrate(150);
    } else {
        incrementUnseenReplies();
        showToast();
    }
};



// Todo: 🚩
const handleRemoveCommentReply = (dispatch, message) => {
    const {commentId} = message;
    dispatch({type: REMOVE_REPLY, payload: commentId});
}

// Todo: 🚩
const handleRemovePost = (dispatch, message, getState) => {
    const {postId, memberId, spaceId} = message;

    // Step 1: Check if the post belongs to the current member
    const currentMemberId = selectCurrentMemberId(getState(), spaceId);
    if (currentMemberId === memberId) return;

    // Step 2: Handle feedback based on current path
    const finalPath = selectFinalPath(getState());
    if (finalPath.startsWith("/post/")) {
        const postIds = finalPath.slice(6);
        const decodedIds = decodeURIComponent(postIds);
        const idList = decodedIds.split(", ").map(id => id.trim());
        if (idList.includes(String(postId))) {
            handlePostRemovalToast(
                dispatch,
                "This post is gone now. You won’t see it again. ✨",
                postId
            )
        }
    } else if (finalPath.startsWith("/comment/")) {
        const commentId = finalPath.split("/")[2];
        const comment = selectCommentByCommentId(getState(), commentId);
        if (comment && comment.postId === postId) {
            handlePostRemovalToast(
                dispatch,
                "The post is deleted now—no more comments or replies. 👋",
                postId
            )
        }
    }

    // Step 3: Dispatch the action to remove the post
    dispatch({
        type: REMOVE_POST,
        payload: {postId, isTodayPost: false},
    });
}

const handlePostRemovalToast = (dispatch, msg, postId) => {
    Toast.show({
        type: "error",
        text1: msg,
    });
    dispatch(setError(postId, GET_POST_ERROR));
};

// Todo: 🚩
const handleApplicationError = (dispatch, payload) => {
    if(payload?.message) {
        Toast.show({type: "error", text1: payload?.message});
    }
}


const wsHandlers = {
    WS_SPACE_CHANNELS_UPDATE: handleSpaceChannels,
    WS_USER_STATUS_UPDATE: handleUserStatus,
    WS_ADD_TEXT: handleAddText,
    WS_LIKE_TEXT: handleLikeText,
    WS_UNLIKE_TEXT: handleUnlikeText,
    WS_DELETE_TEXT: handleDeleteText,
    WS_ADD_TEXT_MESSAGE: handleAddTextMessage,
    WS_REMOVE_TEXT_MESSAGE: handleRemoveTextMessage,
    WS_APPLICATION_ERROR: handleApplicationError,
    WS_ADD_POST_COMMENT: handleAddPostComment,
    WS_REMOVE_POST_COMMENT: handleRemovePostComment,
    WS_DELETE_POST: handleRemovePost,
    WS_ADD_COMMENT_REPLY: handleAddCommentReply,
    WS_REMOVE_COMMENT_REPLY: handleRemoveCommentReply
};

// Main thunk function
export const receiveMessage = (message, channel) => (dispatch, getState) => {
    console.log(`Message received on ${channel}:`, message);

    const handler = wsHandlers[message?.action];
    if (handler) {
        handler(dispatch, message, getState);
    } else {
        console.warn(`Unhandled action type: ${message?.action}`);
    }
};