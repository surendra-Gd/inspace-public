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
    CLEAR_USER_DATA,
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
    DELETE_SPACE,
    SET_REDUX_FRIEND_REQUESTS_SEEN
} from "../constants/userConstants";
import {
    LOGOUT, REFRESH_TOKEN_SUCCESS,
    SET_USER_DATA,
    SIGN_IN_SUCCESS, SIGN_UP_SUCCESS,
    UPDATE_USER_DATA,
    UPDATE_USERNAME
} from "../constants/authConstants";
import {ADD_MEMBER, REMOVE_MEMBER, REMOVE_SPACE, SHIFT_ADMIN, UPDATE_SPACE} from "../constants/spaceConstants";

const initialState = {
    userData: null,
    users: {},
    isMutualRequests: false,
    incomingRequests: [],
    outgoingRequests: [],
    friends: [],
    userSpaces: [],
    suggestedUsers: {
        page: null,
        users: []
    },
    friendSpaces: {},
    friendsOfFriends: {},
    profiles: [],
    spaces: {}
}

const addSuggestedUsers = (state, payload) => ({
    ...state,
    suggestedUsers: {
        page: payload.page,
        users: [...state.suggestedUsers.users, ...payload.users]
    }
})

const setSuggestedUser = (state, payload) => ({
    ...state,
    suggestedUsers: {
        ...state.suggestedUsers,
        users: state.suggestedUsers.users?.map(user =>
            user.user.userId === payload.userId
                ? {...user, requestId: payload.requestId}
                : user
        )
    }
})

const removeSuggestedUser = (state, payload) => {
    if(!state.suggestedUsers?.page) {
        return state;
    } else {
        const updatedUsers = state.suggestedUsers.users
            .filter(item => item.user.userId !== payload);
        return {
            ...state,
            suggestedUsers: {
                ...state.suggestedUsers,
                users:updatedUsers
            }
        }
    }
}

const updateSuggestUsers = (state) => ({
        ...state,
        suggestedUsers: {
            ...state.suggestedUsers,
            users: state.suggestedUsers.users?.filter(user => !user.requestId)
        }
})

const addOutgoingRequests = (state, payload) => ({
    ...state,
    outgoingRequests: [payload, ...state.outgoingRequests]
})

const removeOutgoingRequest = (state, payload) => ({
    ...state,
    outgoingRequests: state.outgoingRequests?.filter(request =>
        request.requestId !== payload
    )
})

const addIncomingRequests = (state, payload) => ({
    ...state,
    incomingRequests: [...state.incomingRequests, payload]
})

const removeIncomingRequest = (state, payload) => ({
    ...state,
    incomingRequests: state.incomingRequests.filter(
        request => request.requestId !== payload
    )
})

const setProfileStatus = (state, payload) => ({
    ...state,
    profiles: state.profiles.map(profile =>
        profile.user.userId === payload
            ? {...profile, request: true}
            : profile
    )
})


export default function userReducer(state = initialState, action) {
    const {type, payload} = action;

    switch (type) {
        case LOGOUT: {
            return {
                ...state,
                userData: null,
                isMutualRequests: false,
                incomingRequests: [],
                outgoingRequests: [],
                friends: [],
                userSpaces: {},
                suggestedUsers: {
                    page: null,
                    users: []
                },
                friendSpaces: [],
                friendsOfFriends: [],
                profiles: [],
                spaces: {}
            }
        }
        case UPDATE_USERNAME:
        case SIGN_IN_SUCCESS:
        case SIGN_UP_SUCCESS:
        case SET_USER_DATA:
        case REFRESH_TOKEN_SUCCESS:
        case UPDATE_USER_DATA: {
            const {user} = payload;
            return {
                ...state,
                userData: user,
                users: {
                    ...state.users,
                    [user.userId]: user
                }
            }
        }

        case CLEAR_USER_DATA: {
            return {...state, userData: null}
        }

        case ADD_MUTUAL_REQUESTS: {
            const {incomingRequests, outgoingRequests} = payload;
            return {
                ...state,
                isMutualRequests: true,
                incomingRequests: payload ? incomingRequests : [],
                outgoingRequests: payload ? outgoingRequests : [],
            }
        }

        case ADD_SUGGESTED_USERS: {
            return addSuggestedUsers(state, payload)
        }

        case SET_SUGGESTED_USER: {
            return setSuggestedUser(state, payload)
        }

        case UPDATE_SUGGESTED_USERS: {
            return updateSuggestUsers(state)
        }

        case REMOVE_SUGGESTED_USER: {
            return removeSuggestedUser(state, payload);
        }

        case ADD_OUTGOING_REQUEST: {
            return addOutgoingRequests(state, payload)
        }

        case REMOVE_OUTGOING_REQUEST: {
            return removeOutgoingRequest(state, payload)
        }

        case ADD_INCOMING_REQUEST: {
            return addIncomingRequests(state, payload)
        }

        case REMOVE_INCOMING_REQUEST: {
            return removeIncomingRequest(state, payload)
        }

        case SET_REDUX_FRIEND_REQUESTS_SEEN: {
            return {
                ...state,
                incomingRequests: state.incomingRequests.map(request =>
                    request?.seen ? request : {...request, seen: true}
                )
            }
        }

        case ADD_FRIENDS: {
            const updatedUsers = { ...state.users };

            payload?.forEach(friend => {
                if(!updatedUsers[friend.userId]) {
                    updatedUsers[friend.userId] = friend
                }
            })
            const userIds = payload?.map(friend => friend.userId);

            return {
                ...state,
                friends: userIds,
                users: updatedUsers
            }
        }

        case ADD_FRIEND: {
            const {user, friendsId} = payload;
            return {
               ...state,
               profiles: state.profiles.map(profile =>
                   profile.user.userId === user.userId
                       ? {...profile, friendsId: friendsId, areFriends: true, request: null}
                       : profile
               ),
               friends: state.friends?.length ? [user.userId, ...state.friends] : [],
                users: {
                   ...state.users,
                    [user.userId]: user
                }
           }
        }

        case ADD_SPACES: {
            const userSpaces = payload.map(space => ({
                spaceId: space.spaceId,
                admin: space.admin,
                members: null
            }));
            const updatedSpaces = { ...state.spaces };
            payload?.forEach(space => {
                if (!updatedSpaces[space.spaceId]) {
                    const {spacename, spaceId, uniqueId} = space
                    updatedSpaces[spaceId] = {
                        spaceId, uniqueId, spacename, request: {
                            requestId: null,
                            status: 'ACCEPT'
                        }
                    };
                }
            });
            return {
                ...state,
                userSpaces: userSpaces,
                spaces: updatedSpaces
            };
        }

        case SET_MEMBERS_COUNT: {
            const {spaceId, count} = payload;
            return {
                ...state,
                userSpaces: state.userSpaces?.map(space =>
                    space.spaceId === spaceId
                        ? {...space, members: count} : space
                )
            }
        }

        case ADD_MEMBER: {
            const {spaceId} = payload;
            return {
                ...state,
                userSpaces: state.userSpaces?.map(space =>
                    space.spaceId === spaceId
                        ? {...space, members: space.members+1} : space
                )
            }
        }


        case DELETE_SPACE: {
            const updatedUserSpaces = state.userSpaces?.filter(space =>
                space.spaceId !== payload
            )
            const {[payload]:removedSpaceInfo, ...remainingSpacesInfo} = state.spaces
            return {
                ...state,
                userSpaces: updatedUserSpaces,
                spaces: remainingSpacesInfo
            }
        }

        case REMOVE_SPACE: {
            const updatedUserSpaces = state.userSpaces?.filter(space =>
                space.spaceId !== payload
            )
            return {
                ...state,
                userSpaces: updatedUserSpaces,
                spaces: {
                    ...state.spaces,
                    [payload]: {
                        ...state.spaces[payload],
                        request: {
                            requestId: null,
                            status: 'DECLINE'
                        }
                    }
                }

            }
        }

        case ADD_PROFILE: {
            return {
                ...state,
                profiles: [...state.profiles, payload]
            }
        }

        case ADD_FRIEND_INFO: {
            const {userId, friendsId, spaces, friends} = payload;

            const updatedSpaces = { ...state.spaces };
            const updatedUsers = { ...state.users };

            spaces?.forEach(space => {
                if (!updatedSpaces[space.spaceId]) {
                    updatedSpaces[space.spaceId] = {
                        ...space, request: null
                    };
                }
            });

            friends?.forEach(friend => {
                if(!updatedUsers[friend.userId]) {
                    updatedUsers[friend.userId] = friend
                }
            })

            const spaceIds = spaces?.map(space => space.spaceId);
            const userIds = friends?.map(friend => friend.userId);

            return {
                ...state,
                friendSpaces: {
                    ...state.friendSpaces,
                    [friendsId]:
                        {friendsId, userId, spaces: spaceIds}
                },
                friendsOfFriends: {
                    ...state.friendsOfFriends,
                    [friendsId]:
                        {friendsId, userId, friends: userIds}
                },
                spaces: updatedSpaces,
                users: updatedUsers,
            }
        }

        case SET_UNFRIEND_PROFILE: {
            const {userId, friendsId} = payload;

            const {[friendsId]:removedSpaceInfo, ...remainingSpacesInfo} = state.friendSpaces
            const {[friendsId]:removedFriendInfo, ...remainingFriendsInfo} = state.friendsOfFriends

            return {
                ...state,
                profiles: state.profiles.map(profile =>
                    profile?.friendsId === friendsId
                        ? {...profile, areFriends: false, friendsId: null, request: true}
                        : profile
                ),
                friends: state.friends.filter(id => id !== userId),
                friendSpaces: remainingSpacesInfo,
                friendsOfFriends: remainingFriendsInfo
            }
        }

        case SET_PROFILE_STATUS:{
            return setProfileStatus(state, payload)
        }

        case SET_SPACE: {
            const {spaceId} = payload;
            return {
                ...state,
                userSpaces: state.userSpaces.length ? [{spaceId, admin:true, members:1}, ...state.userSpaces] : [],
                spaces: {
                    ...state.spaces,
                    [spaceId]: {
                        ...payload,
                        request: {requestId: null, status:'ACCEPT'}
                    }
                }
            }
        }

        case ADD_SEARCHED_SPACE: {
            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [payload.spaceId]: payload
                }
            }
        }

        case SET_SPACE_REQUEST: {
            const {spaceId, request} = payload;
            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [spaceId]: {...state.spaces[spaceId], request}
                }
            }
        }

        case UPDATE_SPACE: {
            const {spaceId, spacename} = payload;
            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [spaceId]: {
                        ...state.spaces[spaceId],
                        spacename
                    }
                }
            }
        }

        case SHIFT_ADMIN: {
            const {spaceId} = payload;

            const updateSpaces = state.userSpaces.map(space =>
                space?.spaceId === spaceId
                    ? {...space, admin:false, members: null}
                    : space
            )

            return {
                ...state,
                userSpaces: updateSpaces
            }
        }

        case REMOVE_MEMBER: {
            const { userId, spaceId } = action.payload;

            // Create a new object to hold the updated friendSpaces
            const updatedFriendSpaces = {};

            // Iterate through each friendSpace entry
            Object.keys(state.friendSpaces).forEach(friendsId => {
                const friendSpace = state.friendSpaces[friendsId];

                // If the userId matches, remove the spaceId from the spaceIds array
                if (friendSpace.userId === userId) {
                    updatedFriendSpaces[friendsId] = {
                        ...friendSpace,
                        spaces: friendSpace.spaces.filter(id => id !== spaceId),
                    };
                } else {
                    // Otherwise, keep the entry as is
                    updatedFriendSpaces[friendsId] = friendSpace;
                }
            });

            return {
                ...state,
                friendSpaces: updatedFriendSpaces,
            };
        }

        default: {
            return state;
        }
    }
}