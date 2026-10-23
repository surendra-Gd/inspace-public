import {
    ADD_ACTION_LOADING,
    CURRENT_PAGE, INCREMENT_UNSEEN_ITEM,
    REMOVE_ACTION_LOADING, REMOVE_UNSEEN_ITEM,
    SET_ERROR
} from "../constants/appConstants";
import {LOGOUT} from "../constants/authConstants";

const initialState = {
    appLoading: {},
    actionLoading: {},
    errors: {},
    currentPage: null,
    unseenTextMessages: {},
    unseenPostComments: {},
    unseenCommentReplies: {}
}


export default function appReducer(state=initialState, action) {
    const {type, payload} = action;

    switch (type) {
        case LOGOUT: {
            return {
                ...state,
                appLoading: {},
                actionLoading: {},
                errors: {},
                currentPage: null,
                unseenTextMessages: {},
                unseenPostComments: {},
                unseenCommentReplies: {}
            }
        }
        case ADD_ACTION_LOADING: {
            const {key, action} = payload;
            return {
                ...state,
                actionLoading: {
                    ...state.actionLoading,
                    [key]: action
                }
            }
        }
        case REMOVE_ACTION_LOADING: {
            const {key, value} = action.payload;

            const updatedActions = Object.keys(state.actionLoading).reduce((acc, k ) => {
                const action = state.actionLoading[k];
                if (k !== key && action !== value) {
                    acc[k] = action;
                }
                return acc;
            }, {});

            return {
                ...state,
                actionLoading: updatedActions
            }
        }
        case SET_ERROR: {
            const {key, error} = payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [key]: {error, message: payload?.message}
                }
            }
        }
        case CURRENT_PAGE: {
            return {
                ...state,
                currentPage: payload
            }
        }

        case INCREMENT_UNSEEN_ITEM: {
            const { spaceId, itemId, itemType } = action.payload;
            if (!spaceId || !itemId || !itemType) return state;

            const spaceItems = state[itemType]?.[spaceId] || {};
            const updatedItems = {
                ...spaceItems,
                [itemId]: (spaceItems[itemId] || 0) + 1,
            };

            return {
                ...state,
                [itemType]: {
                    ...state[itemType],
                    [spaceId]: updatedItems,
                },
            };
        }

        case REMOVE_UNSEEN_ITEM: {
            const { spaceId, itemId, itemType } = action.payload;
            if (!spaceId || !itemId || !itemType) return state;

            const spaceItems = state[itemType]?.[spaceId] || {};
            const { [itemId]: _, ...remainingItems } = spaceItems;

            return {
                ...state,
                [itemType]: {
                    ...state[itemType],
                    [spaceId]: remainingItems
                },
            };
        }

        default:
            return state;
    }
}