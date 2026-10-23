import {
    getMutualRequests,
    getSuggestingUsers,
    getUserByUsername,
    getUserRequest,
    getUser,
    removeFriendRequest,
    getFriendInfo,
    handleFriendRequest,
    unfriend,
    getUserFriends,
    addFriendRequest
} from "../api/userAPI";
import {
    ADD_FRIEND,
    ADD_FRIEND_INFO,
    ADD_FRIENDS,
    ADD_INCOMING_REQUEST,
    ADD_MUTUAL_REQUESTS,
    ADD_OUTGOING_REQUEST,
    ADD_PROFILE,
    ADD_SPACES,
    ADD_SUGGESTED_USERS,
    ADD_SEARCHED_SPACE,
    DELETE_SPACE,
    REMOVE_INCOMING_REQUEST,
    REMOVE_OUTGOING_REQUEST,
    SET_PROFILE_STATUS,
    SET_SPACE,
    SET_SUGGESTED_USER,
    SET_UNFRIEND_PROFILE,
    UPDATE_SUGGESTED_USERS,
    SET_SPACE_REQUEST,
    SET_MEMBERS_COUNT,
    REMOVE_SUGGESTED_USER,
    APP_ERROR,
    PROFILE_ERROR,
    PROFILE_STATUS_ERROR,
    PROFILE_INFO_ERROR,
    FRIENDS_ERROR,
    SPACES_ERROR,
    MEMBER_COUNT_ERROR,
    SPACE_REQUEST_STATUS_ERROR
} from "../constants/userConstants";
import {
    deleteSpace,
    getMemberCount,
    getSpaceByUniqueId,
    getSpaceRequestStatus,
    getUserSpaces,
    addSpaceRequest,
    removeSpaceRequest
} from "../api/spaceAPI";
import {UPDATE_SPACE} from "../constants/spaceConstants";
import {SET_USER_DATA, UPDATE_USER_DATA} from "../constants/authConstants";
import {setError} from "./appActions";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {CONNECT_STOMP} from "../constants/stompConstants";
import {REGISTER_NOTIFICATION} from "../constants/appConstants";

export const getUserAction = () => async (dispatch, getState) => {
    const { userData } = getState()?.auth;
    if (userData) return; // If user is already authenticated, skip

    const profile = JSON.parse(await AsyncStorage.getItem("profile"));
    const accessToken = profile?.access_token;

    if (!profile || !accessToken) {
        dispatch(setError("auth", "Profile or access token missing"));
        return;
    }

    try {
        const { error, data } = await getUser();
        if (error) {
            if (error === "unauthorized" || error === "forbidden") return;
            dispatch(setError("app", APP_ERROR));
        } else {
            await dispatch({
                type: SET_USER_DATA,
                payload: { user: data, isAuthenticated: true },
                meta: { requiresAuth: true }
            });

            dispatch({ type: CONNECT_STOMP });
            dispatch({ type: REGISTER_NOTIFICATION });
        }
    } catch (error) {
        dispatch(setError("app", APP_ERROR));
    }
};



export const getMutualRequestAction = () => async (dispatch, getState) => {
    const hasMutualRequests = getState().user.isMutualRequests;
    if(hasMutualRequests) return;
    try {
        const { error, data } = await getMutualRequests();
        if(error) {
            dispatch(setError("app", APP_ERROR))
            return;
        }
        await dispatch({
            type: ADD_MUTUAL_REQUESTS,
            payload: data,
            meta: {
                requiresAuth: true
            }
        });
    } catch (error) {
        dispatch(setError("app", APP_ERROR))
    }
}


export const getSuggestedUsersAction = (fetchPage) => async (dispatch, getState) => {
    const { incomingRequests, outgoingRequests, suggestedUsers } = getState().user;
    const page = suggestedUsers?.page;
    if (page && fetchPage === page.totalPages) {
        return Promise.resolve();
    }
    try {
        const { error, data } = await getSuggestingUsers({ pageParam: fetchPage });
        if (error) {
            Toast.show({type: "error", text1: error})
            return;
        }
        let { content, currentPage, totalElements, totalPages, first, last, hasNext, hasPrevious } = data;

        if(totalElements < 0) {
            await dispatch({
                type: ADD_SUGGESTED_USERS,
                payload: {
                    page: {
                        currentPage,
                        totalElements,
                        totalPages,
                        first,
                        last,
                        hasNext,
                        hasPrevious,
                    },
                    users: []
                },
                meta: {
                    requiresAuth: true
                }
            })
            return;
        }

        const filterUsers = (requests, user) =>
            !requests.some(req => req.user.userId === user.user.userId);
        content = content.filter(user =>
            filterUsers(incomingRequests, user) && filterUsers(outgoingRequests, user)
        );

        await dispatch({
            type: ADD_SUGGESTED_USERS,
            payload: {
                page: {
                    currentPage,
                    totalElements,
                    totalPages,
                    first,
                    last,
                    hasNext,
                    hasPrevious,
                },
                users: content
            },
            meta: {
                requiresAuth: true
            }
        });
    } catch (error) {
        Toast.show({type: "error", text1: "Error occurred on getting friends of friends"});
    }
};


export const updateSuggestedUsers = () => async (dispatch, getState) => {
    const isUser =  getState().user.suggestedUsers.users.find(u => !!u.requestId);
    if(!isUser) return;
    dispatch({type: UPDATE_SUGGESTED_USERS})
}


export const addFriendRequestAction = (user) => async (dispatch) => {
    const {userId, username} = user;

    try {
        const {
            error = null,
            IncomingRequest = false,
            FriendsFound = false,
            data = null
        } = await addFriendRequest(userId);

        if (error) {
            Toast.show({type: "error", text1: error})
        }
        if(IncomingRequest) {
            const errMsg = username + " already send a request to you";
            Toast.show({type: "error", text1: errMsg})

            const payload = {requestId: data, user: user}
            dispatchAddIncomingRequest(
                dispatch,
                ADD_INCOMING_REQUEST,
                payload
            );
            dispatchRemoveSuggestedUser(
                dispatch,
                REMOVE_SUGGESTED_USER,
                userId
            );
        }
        else if (FriendsFound) {
            const errMsg = "You and " + username + " already friends";
            Toast.show({type: "error", text1: errMsg})

            const payload = {friendsId:data, user:user}
            dispatchRemoveSuggestedUser(
                dispatch,
                REMOVE_SUGGESTED_USER,
                userId
            );
            dispatchAddFriend(
                dispatch,
                ADD_FRIEND,
                payload
            )
        }
        else {
            const request = {"requestId": data, "user": user}
            const payload = {"userId": userId, "requestId": data}
            dispatchAddSuggestedUser(
                dispatch,
                SET_SUGGESTED_USER,
                payload
            )
            dispatchAddOutgoingRequest(
                dispatch,
                ADD_OUTGOING_REQUEST,
                request
            )
        }
    } catch (error) {
        Toast.show({type: "error", text1: "Unexpected error occurred"})
    }
};


const dispatchAddIncomingRequest = (dispatch, type, payload) => {
    dispatch({
        type,
        payload,
        meta: {
            requiresAuth: true
        }
    })
}

const dispatchAddSuggestedUser = (dispatch, type, payload) => {
    dispatch({
        type,
        payload,
        meta: {
            requiresAuth: true
        }
    })
}

const dispatchAddOutgoingRequest = (dispatch, type, payload) => {
    dispatch({
        type,
        payload,
        meta: {
            requiresAuth: true
        }
    })
}

const dispatchRemoveSuggestedUser = (dispatch, type, payload) => {
    dispatch({
        type,
        payload,
        meta: {
            requiresAuth: true
        }
    })
}

const dispatchAddFriend = (dispatch, type, payload) => {
    dispatch({
        type,
        payload,
        meta: {
            requiresAuth: true
        }
    })
}

export const removeFriendRequestAction = (userId, requestId, username) => async (dispatch) => {
    try {
        const {error} = await removeFriendRequest(requestId, username);
        if (error) {
            Toast.show({type: "error", text1: error})
        } else {
            dispatch({type: REMOVE_OUTGOING_REQUEST, payload: requestId})
            dispatch({
                type: SET_SUGGESTED_USER,
                payload: {userId: userId, requestId: null},
                meta: {
                    requiresAuth: true
                }
            })
        }
    } catch (error) {
        Toast.show({type: "error", text1: "Unexpected error occurred."})
    }
};

export const getProfileAction = (target, router) => async (dispatch, getState) => {
    const {userData, profiles} = getState().user;
    if(userData?.username === target) {
        router.push("/account");
    }
    const isExists = profiles.find(profile => profile.user?.username === target);
    if(isExists) {
        return;
    }
    try {
        const { error , data } = await getUserByUsername(target);
        if (error) {
            dispatch(setError(target, PROFILE_ERROR));
            return;
        }
        dispatch({
            type: ADD_PROFILE,
            payload:{...data, request: data.areFriends ? null : false},
            meta: {
                requiresAuth: true
            }
        })
    } catch(error) {
        dispatch(setError(target, PROFILE_ERROR));
    }
}


export const getProfileStatusAction = (targetId) => async (dispatch, getState) => {
    const {profiles, incomingRequests, outgoingRequests} = getState().user;
    let profile = profiles.find(profile => profile.user.userId === targetId);

    if(profile?.request || profile?.areFriends) return;

    // profile areFriends is false in this action when incoming & outgoing is in, but it duplicates
    let isExists = incomingRequests.find(request => request.user.userId === targetId) ||
        outgoingRequests.find(request => request.user.userId === targetId);


    if(isExists) {
        dispatch({type: SET_PROFILE_STATUS, payload: targetId})
        return Promise.resolve();
    }

    try {
        const { error, data } = await getUserRequest(targetId);
        if (error) {
            dispatch(setError(targetId, PROFILE_STATUS_ERROR));
            return;
        }
        const request = {
            "requestId": data?.requestId,
            "user": profile.user
        }
        if(data.profileStatus === "INCOMING") {
            dispatch({type: ADD_INCOMING_REQUEST, payload: request})
        }
        if(data.profileStatus === "OUTGOING") {
            dispatch({type: ADD_OUTGOING_REQUEST, payload: request})
        }
        dispatch({
            type: SET_PROFILE_STATUS,
            payload: targetId,
            meta: {
                requiresAuth: true
            }
        })
    } catch(error) {
        dispatch(setError(targetId, PROFILE_STATUS_ERROR))
    }
}


export const getProfileInfoAction = (friendsId, targetId) => async (dispatch, getState) => {
    const {friendsOfFriends, friendSpaces} = getState().user;
    const idExists = friendsOfFriends[friendsId] || friendSpaces[friendsId]

    if(idExists) {
        return Promise.resolve();
    }
    try {
        const { error, data } = await getFriendInfo(targetId);
        if (error) {
            dispatch(setError(friendsId, PROFILE_INFO_ERROR));
            return;
        }

        dispatch({
            type: ADD_FRIEND_INFO,
            payload: {
                friendsId,
                userId:targetId,
                friends: data.friends,
                spaces: data.spaces
            },
            meta: {
                requiresAuth: true
            }
        })
    } catch (error) {
        dispatch(setError(friendsId, PROFILE_INFO_ERROR));
    }
}

export const handleFriendRequestAction = (user, requestId, action) => async (dispatch) => {
    try {
        const payload = {
            action: action,
            targetId: requestId,
        };
        const {
            error=null,
            invalidStatus=false,
            unAuthorizedAccess=false,
            requestNotFound=false,
            requestUsed=false,
            data
        } = await handleFriendRequest(payload, user?.username);

        let targetId = Number(requestId);

        if (error) {
            Toast.show({type: "error", text1: error})
        } else if(invalidStatus) {
            Toast.show({type: "error", text1: "Invalid response provided"})
        } else if(unAuthorizedAccess || requestUsed|| requestNotFound) {
            dispatch({type: REMOVE_INCOMING_REQUEST, payload: targetId});
        }
        else {
            await dispatch({type: REMOVE_INCOMING_REQUEST, payload: targetId})
            if (action === "accept") {
                dispatch({
                    type: ADD_FRIEND,
                    payload: {friendsId: data, user: user},
                    meta: {
                        requiresAuth: true
                    }
                })
            }
        }
    } catch (error) {
        Toast.show({type: "error", text1: "Unexpected error occurred"});
    }
}

// Todo: Over
export const unFriendAction = (userId, friendsId, username) => async (dispatch) => {
    try {
        const { error } = await unfriend(friendsId, username);
        if (error) {
            Toast.show({type: "error", text1: error});
        } else {
            dispatch({
                type: SET_UNFRIEND_PROFILE,
                payload: {userId, friendsId},
                meta: {
                    requiresAuth: true
                }
            })
        }
    } catch(error) {
        Toast.show({type: "error", text1: "Unexpected error occurred. Please try again later."});
    }
}

export const getFriendsAction = () => async (dispatch, getState) => {
    const {friends} = getState().user;
    const {error} = getState().app?.errors["friends"] || {};

    if(friends.length > 0 || error === FRIENDS_ERROR) return;

    try {
        const { error, data } = await getUserFriends();
        if(error) {
            dispatch(setError("friends", FRIENDS_ERROR));
            return;
        }
        dispatch({
            type:ADD_FRIENDS,
            payload: data ? data : [],
            meta: {
                requiresAuth: true
            }
        })
    } catch (error) {
        dispatch(setError("friends", FRIENDS_ERROR))
    }
}


export const getUserSpacesAction = () => async (dispatch, getState) => {
    const {userSpaces} = getState().user;
    const {error} = getState().app?.errors["friends"] || {};
    if(userSpaces.length > 0 || error === SPACES_ERROR) return;

    // Todo: what happen space request
    try {
        const { error, data } = await getUserSpaces();
        if (error) {
            dispatch(setError("spaces", SPACES_ERROR));
            return;
        }
        dispatch({
            type: ADD_SPACES,
            payload: data,
            meta: {
                requiresAuth: true
            }
        })
    } catch (error) {
        dispatch(setError("spaces", SPACES_ERROR));
    }
}


// Todo: what happen space request
export const createSpaceAction = async (response, dispatch) => {
    await dispatch({
        type: SET_SPACE,
        payload: response,
    })
}


export const deleteSpaceAction = (feedback, spaceId, onClose) => async (dispatch) => {
    try {

        const request = {
            "spaceId": spaceId,
            "feedback": feedback
        }

        const { error } = await deleteSpace(request);
        if (error) {
            Toast.show({type: "error", text1: error})
        }
        else {
            await dispatch({
                type: DELETE_SPACE,
                payload: spaceId,
                meta: {
                    requiresAuth: true
                }
            })
            Toast.show({type: "success", text1: "Space deleted successfully."})
            onClose();
        }
    } catch (error) {
        Toast.show({type: "error", text1: "Unexpected error occurred. Please try again later."})
    }
}


export const getSpaceAction = (uniqueId) => async (dispatch, getState) => {
    const {spaces} = getState().user;
    let isExists = Object.values(spaces).find(space =>
        space.uniqueId === uniqueId
    )
    if(isExists) return Promise.resolve();

    try {
        const { error, data } = await getSpaceByUniqueId(uniqueId);
        if(error) {
            Toast.show({type: "error", text1: error})
        }
        else {
            dispatch({
                type: ADD_SEARCHED_SPACE,
                payload: {...data, request: null},
                meta: {
                    requiresAuth: true
                }
            })
        }
    } catch (error) {
        Toast.show({type: "error", text1: "Unexpected error occurred"});
    }
}


export const addSpaceRequestAction = (spaceId, uniqueId) => async(dispatch) => {
    try {
        const {
            spaceMemberExists=false,
            spaceRequestFound=false,
            error=null,
            data=null
        } = await addSpaceRequest(spaceId);

        if(error) {
            Toast.show({type: "error", text1: error});
        }
        else if(spaceRequestFound) {
            Toast.show({type: "error", text1: "You already send request to " + uniqueId});
            dispatch({
                type:SET_SPACE_REQUEST,
                payload: {spaceId, request: {requestId: data, status: "PROCESS"}},
                meta: {
                    requiresAuth: true
                }
            })
        }
        else if(spaceMemberExists) {
            Toast.show({type: "error", text1: "Info! You already member to that " + uniqueId})
            dispatch({
                type:SET_SPACE_REQUEST,
                payload: {spaceId, request: {requestId: null, status: "ACCEPT"}}
            });
            // Todo: Some dispatch is remained.
        } else {
            dispatch({
                type:SET_SPACE_REQUEST,
                payload: {spaceId, request:data},
                meta: {
                    requiresAuth: true
                }
            })
        }
    } catch (error) {
        Toast.show({type: "error", text1: "Unexpected error occurred"});
    }
}

export const removeSpaceRequestAction = (spaceId, requestId, uniqueId) => async(dispatch) => {
    try {
        const { error } = await removeSpaceRequest(requestId, uniqueId);
        if(error) {
            Toast.show({type: "error", text1: error})
        } else {
            const request = {requestId: null, status: "DECLINE"}
            dispatch({
                type: SET_SPACE_REQUEST,
                payload: {spaceId: spaceId, request: request},
                meta: {
                    requiresAuth: true
                }
            })
        }
    } catch (error) {
        Toast.show({type: "error", text1: "Unexpected error occurred."});
    }
}

export const updateUserAction = (user) => async (dispatch) => {
    // Warn: Don't Touch payload user because it is also used in username changing
    await dispatch({type: UPDATE_USER_DATA, payload: {user}});
}

export const updateSpaceAction = (spacename, spaceId) => async (dispatch) => {
    dispatch({
        type: UPDATE_SPACE,
        payload: {spaceId, spacename}
    })
}


export const getSpaceMembersCountAction = (spaceId) => async (dispatch, getState) => {
    const {userSpaces} = getState().user;
    const memberCount = userSpaces.find(space => space.spaceId === spaceId)?.members;
    if(memberCount) return;

    try {
        const { error, data } = await getMemberCount(spaceId);
        if(error) {
            dispatch(setError(spaceId, MEMBER_COUNT_ERROR));
            return;
        }
        dispatch({
            type: SET_MEMBERS_COUNT,
            payload: {spaceId, count:data},
            meta: {
                requiresAuth: true
            }
        })
    } catch (error){
        dispatch(setError(spaceId, MEMBER_COUNT_ERROR));
    }
}


export const getSpaceRequestStatusAction = (spaceId) => async(dispatch, getState) => {
    const {spaces} = getState().user;
    const isExists = spaces[spaceId]?.request;
    if(isExists) return;

    // retrieve multiple times avoid it
    // Todo: What happen user space requests

    try {
        const { error, data } = await getSpaceRequestStatus(spaceId);
        if(error) {
            dispatch(setError(spaceId, SPACE_REQUEST_STATUS_ERROR))
            return;
        }
        dispatch({
            type: SET_SPACE_REQUEST,
            payload: {spaceId:spaceId, request:data },
            meta: {
                requiresAuth: true
            }
        })
    } catch (error) {
        dispatch(setError(spaceId, SPACE_REQUEST_STATUS_ERROR))
    }
}