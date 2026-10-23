import {
    ADD_SPACE,
    REMOVE_SPACE,
    UPDATE_SPACE,
    ADD_MEMBER,
    REMOVE_MEMBER,
    REMOVE_REQUEST,
    ADD_POST,
    SHIFT_ADMIN,
    SET_MEMBER,
    SET_CURRENT_SPACE,
    SET_MEMBERS,
    SET_ACTIVITIES,
    SET_FEED,
    SET_POST_COUNT,
    CLEAR_CURRENT_SPACE,
    SET_REQUESTS,
    ADD_ACTIVITY,
    UPDATE_MEMBER_ONLINE_STATUS,
    ONLINE,
    SET_TEXTS,
    UPDATE_STREAK,
    SET_STREAKS,
    SET_POSTS,
    REMOVE_POST, SET_UNSEEN_SPACE_REQUESTS, UPDATE_UNSEEN_SPACE_REQUESTS
} from '../constants/spaceConstants';
import {LOGOUT, UPDATE_USER_DATA, UPDATE_USERNAME} from "../constants/authConstants";
import {DELETE_SPACE} from "../constants/userConstants";


const initialState = {
    currentSpaceId: null,
    spaces: {},
    members: {},
    unseenSpaceRequests: {},
}

const spacesReducer = (state = initialState, action) => {
    switch (action.type) {

        case LOGOUT: {
            return {
                ...state,
                currentSpaceId: null,
                spaces: {},
                members: {},
                unseenSpaceRequests: {}
            }
        }

        case SET_CURRENT_SPACE: {
            const spaceId = action.payload;
            return {
                ...state,
                currentSpaceId: spaceId
            };
        }

        case CLEAR_CURRENT_SPACE: {
            return {
                ...state,
                currentSpaceId: null
            };
        }

        case ADD_SPACE: {
            const {space, member} = action.payload;
            const {spaceId} = space;
            return {
                ...state,
                currentSpaceId: spaceId,
                spaces: {
                    ...state.spaces,
                    [spaceId]: {
                        spaceId: spaceId,
                        spaceData: space,
                        currentMember: member,
                        todayPosts: null,
                        isFeedFetched: false,
                        isMembersFetched: false,
                        requests: [],
                        activities: {
                            page: null,
                            body: []
                        },
                        texts: {
                            page: null
                        }
                    }
                }
            };
        }

        // Todo: memberIds in members on space obj is not necessary
        case SET_MEMBERS: {
            const members = action.payload;

            const newMembers = members.reduce((acc, member) => ({
                ...acc,
                [member.memberId]: {...member, streaksPage: null, postPage: null}
            }), state.members);

            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [state.currentSpaceId]: {
                        ...state.spaces[state.currentSpaceId],
                        isMembersFetched: true
                    }
                },
                members: newMembers
            };
        }

        case UPDATE_MEMBER_ONLINE_STATUS: {
            const {userId, status} = action.payload;

            const updatedMembers = Object.fromEntries(
                Object.entries(state.members).map(([memberId, member]) => {
                    if (member.user.userId === userId) {
                        return [
                            memberId,
                            {
                                ...member,
                                userOnline: status === ONLINE,
                            },
                        ];
                    }
                    return [memberId, member];
                })
            );

            return {
                ...state,
                members: updatedMembers,
            };
        }

        case UPDATE_STREAK: {
            const {memberId, streak} = action.payload;
            const formatedId = String(memberId);
            if (!state.members[formatedId]) {
                return state;
            }
            return {
                ...state,
                members: {
                    ...state.members,
                    [formatedId]: {
                        ...state.members[formatedId],
                        streak: state.members[formatedId].streak + streak,
                        lastStreak: streak
                    },
                },
            };
        }

        case SET_STREAKS: {
            const {page, memberId} = action.payload;
            const updatedMembers = Object.keys(state.members)
                .reduce((acc, id) => {
                    const member = state.members[id];
                    if (id === memberId) {
                        acc[id] = {...member, streaksPage: page};
                    } else {
                        acc[id] = member;
                    }
                    return acc;
                }, {});

            return {
                ...state,
                members: updatedMembers
            };
        }

        case SET_POST_COUNT: {
            const count = action.payload;
            const spaceId = state.currentSpaceId;
            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [spaceId]: {
                        ...state.spaces[spaceId],
                        todayPosts: count
                    }
                }
            };
        }

        case SET_FEED: {
            const spaceId = state.currentSpaceId;
            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [spaceId]: {
                        ...state.spaces[spaceId],
                        isFeedFetched: true
                    }
                }
            };
        }

        case SET_ACTIVITIES: {
            const {page, body} = action.payload;
            const spaceId = state.currentSpaceId;
            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [spaceId]: {
                        ...state.spaces[spaceId],
                        activities: {
                            page: page,
                            body: [...state.spaces[spaceId].activities.body, ...body]
                        }
                    }
                }
            };
        }

        case SET_REQUESTS: {
            const requests = action.payload;
            const spaceId = state.currentSpaceId;
            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [spaceId]: {
                        ...state.spaces[spaceId],
                        requests: requests
                    }
                }
            }
        }

        case REMOVE_REQUEST: {
            const requestId = action.payload;
            const spaceId = state.currentSpaceId;
            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [spaceId]: {
                        ...state.spaces[spaceId],
                        requests: state.spaces[spaceId].requests.length > 1
                            ? state.spaces[spaceId].requests
                                .filter(request => request.requestId !== requestId)
                            : null
                    }
                }
            };
        }

        // Todo: Mentioned case type clearly and memberId storing is not necessary.
        // before store in members check if members is existing on members on space
            // Todo: what about last streak and total streak.
        case ADD_MEMBER: {
            const {member, activity} = action.payload;

            const spaceId = state.currentSpaceId;
            const space = state.spaces[spaceId];

            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [spaceId]: {
                        ...space,
                        activities: {
                            ...space.activities,
                            body: [activity, ...space.activities.body]
                        }
                    }
                },
                members: {
                    ...state.members,
                    [member.memberId]: {...member, streaksPage: null, postPage: null}
                }
            };
        }

        case SET_MEMBER: {
            const member = action.payload;

            return {
                ...state,
                members: {
                    ...state.members,
                    [member.memberId]: {...member, streaksPage: null, postPage: null}
                }
            }
        }

        case SET_POSTS: {
            const {memberId, page} = action.payload;
            return {
                ...state,
                members: {
                    ...state.members,
                    [memberId]: {
                        ...state.members[memberId],
                        postPage: page
                    },
                }
            };
        }


        case ADD_POST: {
            const spaceId = state.currentSpaceId;
            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [spaceId]: {
                        ...state.spaces[spaceId],
                        todayPosts: state.spaces[spaceId].todayPosts + 1
                    }
                },
            };
        }

        case REMOVE_POST: {
            const {isTodayPost} = action.payload;
            if(!isTodayPost) return state;

            const space = state.spaces[state.currentSpaceId];
            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [state.currentSpaceId]: {
                        ...state.spaces[state.currentSpaceId],
                        todayPosts: space.todayPosts !== null ? space.todayPosts - 1 : null,
                    }
                }
            };
        }



        case DELETE_SPACE:
        case REMOVE_SPACE: {
            const spaceId = action.payload;

            if (!state.spaces[spaceId])
                return state;

            // Remove the space
            const {[spaceId]: removedSpace, ...restSpaces} = state.spaces;


            // Remove members related to the spaceId
            const membersWithoutSpace = Object?.keys(state.members).reduce((acc, memberId) => {
                const member = state.members[memberId]
                if (member.spaceId !== spaceId) {
                    acc[memberId] = state.members[memberId];
                }
                return acc;
            }, {});

            return {
                ...state,
                currentSpaceId: null,
                spaces: restSpaces,
                members: membersWithoutSpace
            };
        }


        case UPDATE_SPACE: {
            const {spaceId: id, spacename} = action.payload;
            const updatedSpaces = Object.keys(state.spaces).reduce((acc, spaceId) => {
                const space = state.spaces[spaceId];
                if (spaceId === id.toString()) {
                    acc[spaceId] = {
                        ...space,
                        spaceData: {...space.spaceData, spacename}
                    }
                } else {
                    acc[spaceId] = space;
                }
                return acc;
            }, {});
            return {
                ...state,
                spaces: updatedSpaces || {}
            }
        }


        case REMOVE_MEMBER: {
            const {memberId} = action.payload;

            const {[memberId]: removedMember, ...remainingMembers} = state.members;

            return {
                ...state,
                members: remainingMembers,
            };
        }


        case ADD_ACTIVITY: {
            const activity = action.payload;
            const spaceId = state.currentSpaceId;
            const space = state.spaces[spaceId];

            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [spaceId]: {
                        ...space,
                        activities: {
                            ...space.activities,
                            body: [activity, ...space.activities.body],
                        }
                    },
                },
            }
        }


        case SHIFT_ADMIN: {
            const {spaceId, currentMemberId, user, targetUserId} = action.payload;
            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [spaceId]: {
                        ...state.spaces[spaceId],
                        spaceData: {
                            ...state.spaces[spaceId].spaceData,
                            admin: user
                        },
                        currentMember: {
                            ...state.spaces[spaceId].currentMember,
                            admin: false
                        },
                        requests: [],
                    }
                },
                members: {
                    ...state.members,
                    [currentMemberId]: {...state.members[currentMemberId], admin: false},
                    [targetUserId]: {...state.members[targetUserId], admin: true}
                }
            };
        }


        case UPDATE_USERNAME:
        case UPDATE_USER_DATA: {
            const user = action.payload.user;
            const updatedMembers = Object.keys(state.members).reduce((acc, memberId) => {
                const member = state.members[memberId];
                if (member.user.userId === user.userId) {
                    acc[memberId] = {
                        ...member,
                        user: user
                    };
                } else {
                    acc[memberId] = member;
                }
                return acc;
            }, {});
            const updatedSpaces = Object.keys(state.spaces).reduce((acc, spaceId) => {
                const space = state.spaces[spaceId];
                return {
                    ...acc,
                    [spaceId]: {
                        ...space,
                        currentMember: {...space.currentMember, user: user}
                    }
                };
            }, {});

            return {
                ...state,
                members: updatedMembers,
                spaces: updatedSpaces
            };
        }

        case SET_TEXTS: {
            const {page} = action.payload;
            const spaceId = state.currentSpaceId;

            return {
                ...state,
                spaces: {
                    ...state.spaces,
                    [spaceId]: {
                        ...state.spaces[spaceId],
                        text: {
                            page: page
                        }
                    }
                }
            };
        }


        case SET_UNSEEN_SPACE_REQUESTS: {
            const {spaceId, count} = action.payload || {};
            if (spaceId == null || count == null) return state;

            return {
                ...state,
                unseenSpaceRequests: {
                    ...(state.unseenSpaceRequests || {}),
                    [spaceId]: count,
                },
            };
        }


        case UPDATE_UNSEEN_SPACE_REQUESTS: {
            const spaceId = action.payload;

            // Safely extract and remove the specific space's unseen requests count
            const {[spaceId]: currentSpaceRequestCount, ...remainingRequestsCount} = state.unseenSpaceRequests || {};

            // Update the requests for the specific space, marking them as seen
            const updatedRequests = (state.spaces[spaceId]?.requests || []).map((request) => ({
                ...request,
                seen: true,
            }));

            return {
                ...state,
                unseenSpaceRequests: remainingRequestsCount,
                spaces: {
                    ...state.spaces,
                    [spaceId]: {
                        ...state.spaces[spaceId],
                        requests: updatedRequests,
                    },
                },
            };
        }

        default:
            return state;
    }
};

export default spacesReducer;