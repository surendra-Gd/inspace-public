import {
    getActivities,
    getCurrentSpace,
    getSpaceMembers,
    getSpaceRequests,
    handleSpaceRequest,
    leaveSpace,
    removeMember,
    shiftAdmin
} from "../api/spaceAPI";
import {
    ADD_ACTIVITY,
    ADD_EMOJI,
    ADD_MEMBER,
    ADD_POST,
    ADD_SPACE,
    CLEAR_CURRENT_SPACE,
    MEMBER_POST_ERROR,
    POST_COUNT_ERROR,
    REMOVE_EMOJI,
    REMOVE_MEMBER,
    REMOVE_POST,
    REMOVE_REQUEST,
    REMOVE_SPACE, REQUESTS_FAILED,
    SET_ACTIVITIES,
    SET_CURRENT_SPACE,
    SET_FEED,
    SET_MEMBERS,
    SET_POST_COUNT, SET_POSTS,
    SET_REQUESTS,
    SHIFT_ADMIN,
    SPACE_ERROR, UPDATE_STREAK
} from "../constants/spaceConstants";
import {
    addEmoji,
    deletePost,
    getFeed,
    getMemberPosts,
    getPostCount,
    removeEmoji,
    uploadPost
} from "../api/postAPI";
import {setError} from "./appActions";
import {isSharedToday} from "../../utils";
import Toast from "react-native-toast-message";


// Todo: Duplicate keys with same error.
export const clearCurrentSpaceIdAction = () => async (dispatch) => {
    dispatch({ type: CLEAR_CURRENT_SPACE });
};

export const setCurrentSpaceIdAction = (spaceId) => async (dispatch) => {
    dispatch({ type: SET_CURRENT_SPACE, payload: spaceId })
}


export const addSpaceAction = (spaceId, router) => async (dispatch, getState) => {
    const {spaces} = getState().space;
    const space = Object.values(spaces).find(space =>
        space.spaceData.spaceId === spaceId
    );
    if (space) {
        dispatch({type:SET_CURRENT_SPACE, payload: space.spaceId})
        return;
    }
    const {userId} = getState().user?.userData;

    try {
        const { error, data } = await getCurrentSpace(spaceId);
        if (error) {
            if(error?.status === 404) {
                Toast.show({type: "error", text1: "space not found"});
                router.replace("+not-found")
            }
            else if(error?.status === 403) {
                Toast.show({type: "error", text1: "You does not have permission to access the space."})
                router.replace("/access-denied")
            }
            else {
                dispatch(setError(spaceId, SPACE_ERROR));
            }
        }
        else {
            const {admin, spaceId, spacename, uniqueId, member} = data;
            const userIsAdmin = admin?.userId === userId;

            dispatch({
                type: ADD_SPACE,
                payload: {space: {admin, spaceId, spacename, uniqueId}, member},
                meta: {isAdmin: userIsAdmin}
            });
        }
    } catch (error) {
        dispatch(setError(spaceId, SPACE_ERROR));
    }
};



export const getSpaceMembersAction = () => async (dispatch, getState) => {
    const { spaces, currentSpaceId } = getState().space;
    const {isMembersFetched, currentMember} = spaces[currentSpaceId];

    if (isMembersFetched) return;
    let currentMemberId = currentMember?.memberId;

    try {
        const { error, data } = await getSpaceMembers(currentSpaceId);
        const members = data.sort((a, b) => {
            if (a.memberId === currentMemberId && b.memberId !== currentMemberId) return -1;
            else if (b.memberId === currentMemberId && a.memberId !== currentMemberId) return 1;
            return b.admin - a.admin;
        });
        if (error) {
            dispatch(setError(currentSpaceId, SPACE_ERROR));
            return;
        }
        await dispatch({
            type: SET_MEMBERS,
            payload: members,
            meta: {
                requiresAuth: true
            }
        });
    } catch (error) {
        dispatch(setError(currentSpaceId, SPACE_ERROR));
    }
};

export const getPostsCountAction = (spaceId) => async (dispatch, getState) => {
    const { spaces } = getState().space;
    if (spaces[spaceId]?.todayPosts !== null) return;

    try {
        const {error, data} = await getPostCount();
        if (error) {
            dispatch(setError(spaceId, POST_COUNT_ERROR));
            return;
        }
        dispatch({
            type: SET_POST_COUNT,
            payload: data,
            meta: {
                requiresAuth: true
            }
        })
    } catch (error) {
        dispatch(setError(spaceId, POST_COUNT_ERROR));
    }
};



export const getFeedAction = (spaceId) => async (dispatch, getState) => {
    const { spaces } = getState().space;
    if (spaces[spaceId]?.isFeedFetched) return;
    try {
        const {error, data} = await getFeed(spaceId);
        if (error) {
            dispatch(setError(spaceId, SPACE_ERROR));
            return;
        }

        dispatch({type: SET_FEED, payload: data, meta: {requiresAuth: true}});
    } catch (error) {
        dispatch(setError(spaceId, SPACE_ERROR));
    }
};



export const getActivityAction = (fetchPage, spaceId) => async (dispatch, getState) => {
    const { spaces } = getState().space;
    const page = spaces[spaceId]?.activities?.page;
    if (page && fetchPage === page.totalPages) return;


    try {
        const {error, data} = await getActivities({ pageParam: fetchPage, spaceId });
        if (error) {
            Toast.show({type: "error", text1: error});
            return;
        }
        let { content, currentPage, totalElements, totalPages, first, last, hasNext, hasPrevious } = data;
        dispatch({
            type: SET_ACTIVITIES,
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
                body: content
            },
            meta: {
                requiresAuth: true
            }
        })
    } catch (error) {
        Toast.show({type: "error", text1: "Unexpected error occurred. Please try again later."});
    }
};


export const getSpaceRequestsAction = (spaceId) => async (dispatch) => {
    try {
        const { error, data } = await getSpaceRequests();
        if (error) {
            dispatch(setError(spaceId, REQUESTS_FAILED));
            return;
        }
        dispatch({
            type: SET_REQUESTS,
            payload: data.length ? data : null,
            meta: {
                requiresAuth: true
            }
        })
    } catch (error) {
        dispatch(setError(spaceId, REQUESTS_FAILED));
    }
};

export const getMemberPostsAction = (fetchPage, memberId) => async (dispatch, getState) => {
    const { members } = getState().space;
    const page = members[memberId].postPage;

    if (page && fetchPage === page.totalPages) return;

    try {
        const {error, data} = await getMemberPosts(memberId, fetchPage);
        if (error) {
            dispatch(setError(memberId, MEMBER_POST_ERROR, error));
            return;
        }
        let { content, currentPage, totalElements, totalPages, first, last, hasNext, hasPrevious } = data;

        await dispatch({
            type: SET_POSTS,
            payload: {
                posts: content,
                memberId: memberId,
                page: {
                    currentPage,
                    totalElements,
                    totalPages,
                    first,
                    last,
                    hasNext,
                    hasPrevious
                }},
            meta: {requiresAuth: true}
        });
    } catch (error) {
        Toast.show({type: "error", text1:"Something went wrong. Please try again later."});
    }
};


export const handleSpaceRequestAction = (user, formData) => async (dispatch, getState) => {
    const spaceId = getState().space.currentSpaceId;
    const { status, requestId } = formData;
    try {
        const {
            error=null,
            data=null,
            requestUsed=false,
            requestNotFound=false,
            unAuthorizedAccess=false
        } = await handleSpaceRequest(formData, user?.username);

        if (error) {
            Toast.show({type: "error", text1: error});
        }
        else if(requestUsed || requestNotFound || unAuthorizedAccess) {
            dispatchRemoveSpaceRequest(
                dispatch,
                REMOVE_REQUEST,
                requestId
            );
        }
        else {
            dispatchRemoveSpaceRequest(
                dispatch,
                REMOVE_REQUEST,
                requestId
            );
            if (status === "ACCEPT") {
                const {memberId, activityId, joinedOn} = data;
                const activity = {activityId, user, prompt: "JOINED", timestamp: joinedOn};
                const member = {memberId, spaceId, joinedOn, user, admin: false};
                dispatch({
                    type: ADD_MEMBER, payload: {activity: activity, member: member, spaceId}
                })
            }
        }
    } catch (error) {
        Toast.show({type: "error", text1: "Unexpected error occurred"});
    }
};

const dispatchRemoveSpaceRequest = (dispatch, type, payload) => {
    dispatch({
        type,
        payload,
        meta: {
            requiresAuth: true
        }
    })
}


export const addEmojiAction = (postId, payload, memberId) => async (dispatch, getState) => {
    const {emojis} = getState().post;
    const isEmojiExists =  Object.values(emojis).some(
        emoji => emoji.postId === postId && emoji.emojiMember === memberId
    );
    if(isEmojiExists) return;

    try {
        const {
            error=null,
            data=null,
            unAuthorizedAccess=false,
            emojiFound=false
        } = await addEmoji(payload);

        if (error) {
            Toast.show({type: "error", text1: error});
        }
        else if(emojiFound) {
            Toast.show({type: "error", text1: "You already set emoji to that post."});
            const emoji = {emojiId: data, emojiMember: memberId, ...payload}
            dispatchAddEmoji(dispatch, ADD_EMOJI, emoji)
        }
        else if(unAuthorizedAccess) {
            Toast.show({type: "error", text1: "You does not have permission to add emoji."});
        }
        else {
            const emoji = {emojiId: data, emojiMember: memberId, ...payload}
            dispatchAddEmoji(dispatch, ADD_EMOJI, emoji)
        }
    } catch (err) {
        Toast.show({type: "error", text1: "Unexpected error occurred."});
    }
};

const dispatchAddEmoji = (dispatch, type, payload) => {
    dispatch({
        type,
        payload,
        meta: {
            requiresAuth: true
        }
    })
}


export const removeEmojiAction = (emojiId) => async (dispatch, getState) => {
    const {emojis} = getState().post;
    if(!emojis[emojiId]) {
        return;
    }
    try {
        const { error } = await removeEmoji(emojiId);
        if (error) {
            Toast.show({type: "error", text1: error});
        }
        dispatch({
            type: REMOVE_EMOJI,
            payload:emojiId,
            meta: {
                requiresAuth: true
            }
        });
    } catch (error) {
        Toast.show({type: "error", text1: "Unexpected error occurred."});
    }
};

export const shiftAdminAction = (targetUserId, onClose) => async (dispatch, getState) => {
    const {currentSpaceId, spaces, members} = getState().space;
    try {
        const { error } = await shiftAdmin(targetUserId);
        if (error) {
            Toast.show({type: "error", text1: error});
            return;
        }
        const user = members[targetUserId]?.user;
        const currentMemberId = spaces[currentSpaceId]?.currentMember?.memberId;
        await dispatch({
            type: SHIFT_ADMIN,
            payload: { targetUserId, user, spaceId: currentSpaceId, currentMemberId },
            meta: {
                requiresAuth: true
            }
        });
        Toast.show({type: "success", text1: "change admin to " + user?.username})
        onClose();
    } catch (error) {
        Toast.show({type: "error", text1: "Something went wrong. Please try again later."});
    }
};


export const removeMemberAction = (memberId, feedback, onClose) => async (dispatch, getState) => {
    const {currentSpaceId, members} = getState().space;
    const {user} = members[memberId];

    const request = {
        "memberId": memberId,
        "feedback": feedback
    }

    try {
        const {
            operationFailed = false,
            error=null,
            data=null
        } = await removeMember(request);

        if (error) {
            Toast.show({type: "error", text1: error})
        }
        else if(operationFailed) {
            await dispatch({
                type: REMOVE_MEMBER,
                payload: {
                    userId: user?.userId,
                    memberId: Number(memberId),
                    spaceId: currentSpaceId
                }
            })
        } else {
            const activity = {activityId: data?.activityId, user, prompt: "REMOVE", timestamp: data?.joinedOn};
            await dispatch({
                type: REMOVE_MEMBER,
                payload: {
                    userId: user?.userId,
                    memberId: Number(memberId),
                    spaceId: currentSpaceId

                }
            })
            await dispatch({type: ADD_ACTIVITY, payload: activity})
            Toast.show({type: "success", text1: "Member removed successfully. It will take time to update after 24 hrs."});
            onClose();
        }
    } catch (error) {
        Toast.show({type: "error", text1: "Unexpected error occurred. Please try again later."});
    }
};

// Todo: Emojis not removed properly
export const leaveSpaceAction = (memberId, feedback, spaceId, router) => async (dispatch) => {
    try {
        const { error } = await leaveSpace(spaceId, memberId, feedback);
        if (error) {
            Toast.show({type: "error", text1: error})
        } else {
            await dispatch({
                type: REMOVE_SPACE,
                payload: spaceId,
                meta: {
                    requiresAuth: true
                }
            });
            router.replace("/spaces");
        }
    } catch (error) {
        Toast.show({type: "error", text1: "Unexpected error occurred"});
    }
};



// Action to handle post upload, member page update, and streak handling
export const addPostAction = (spaceId, memberId, formData, profile) => async (dispatch, getState) => {
    // Get current space details from the state
    const { currentSpaceId, spaces } = getState().space;
    const space = spaces[currentSpaceId];

    // If the user has already posted 3 times today, prevent further posting
    if (space && space.todayPosts >= 3) return;

    try {
        // Attempt to upload the post using the provided data
        const { error, data } = await uploadPost(spaceId, memberId, formData);

        // Show an error if the upload fails
        if (error) {
            Toast.show({ type: 'error', text1: 'Something went wrong. Please try again later.' });
            return;
        }

        // Extract the post data
        const post = data?.content;

        dispatch({
            type: ADD_POST,
            payload: post,
            meta: { requiresAuth: true }
        });

        // Handle the streak update if applicable
        handleStreakUpdate(dispatch, memberId, data?.streak, profile);
    } catch (error) {
        // If an error occurs during the try block, show a generic error message
        Toast.show({ type: 'error', text1: 'Something went wrong. Please try again later.' });
    }
};




// Handles the streak update after posting
const handleStreakUpdate = (dispatch, memberId, streak, profile) => {
    // If the user has earned a streak, display a success message
    if (streak > 0) {
        Toast.show({
            type: "streak",
            autoHide: false,
            onPress: () => {},
            props: {
                streakCount: streak,
                profileUri: profile,
            },
        })
        // Update the user's streak in the Redux store
        dispatch({
            type: UPDATE_STREAK,
            payload: { memberId, streak }
        });
    } else {
        // If no streak is earned, show a success message indicating the post was uploaded
        Toast.show({ type: "success", text1: "Post Uploaded successfully." });
    }
};



export const removePostAction = (memberId, post) => async (dispatch) => {
    const { postId, sharedOn } = post;
    try {
        const { error } = await deletePost(postId);
        if (error) {
            throw new Error(error);
        }
        const isTodayPost = isSharedToday(sharedOn);
        dispatch({
            type: REMOVE_POST,
            payload: {postId, isTodayPost},
            meta: {
                requiresAuth: true
            }
        })
    } catch (error) {
        throw new Error(error);
    }
};