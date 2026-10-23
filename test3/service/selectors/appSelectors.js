import {createSelector} from "reselect";
import {useSelector} from "react-redux";
import {getCurrentSpaceId} from "./spaceSelectors";

const getActionLoadings = (state) => state.app?.actionLoading;
const selectCurrentPage = (state) => state.app?.currentPage;
const getErrors = (state) => state.app?.errors || {};
const selectUnseenTextMessages = (state) => state.app?.unseenTextMessages;
const selectUnseenCommentReplies = (state) => state.app?.unseenCommentReplies;
const selectUnseenPostComments = (state) => state.app?.unseenPostComments;

// Todo: use reselect.
export const getLoadingState = (state, key, value) => {
    const loadings = getActionLoadings(state);
    return (loadings[key] && loadings[key] === value) || false;
}


// Memoized selector to calculate the final path
export const selectFinalPath = createSelector(
    [selectCurrentPage],
    (currentPage) => {
        if (!currentPage) return null;

        const segments = currentPage.split('/').filter(Boolean); // Split into segments
        return `/${segments.slice(-2).join('/')}`; // Join the last two segments
    }
);


export const selectIsErrorExists = createSelector(
    [
        getErrors,
        (state, id) => id,
        (state, id, errorType) => errorType
    ],
    (errors, id, errorType) => {
        if(!errors[id]) return false;
        return errors[id]?.error === errorType;
    }
);

export const selectUnseenMessageCountByTextId = createSelector(
    [selectUnseenTextMessages, getCurrentSpaceId, (_, textId) => textId],
    (unseenMessages, spaceId, textId) => {
        const spaceMessages = unseenMessages[spaceId] || {};
        return spaceMessages[textId] || 0;
    }
);

export const selectUnseenRepliesCountByCommentId = createSelector(
    [selectUnseenCommentReplies, getCurrentSpaceId, (_, commentId) => commentId],
    (unseenReplies, spaceId, commentId) => {
        const spaceReplies = unseenReplies[spaceId] || {};
        return spaceReplies[commentId] || 0;
    }
)

export const selectUnseenCommentsCountByPostId = createSelector(
    [selectUnseenPostComments, getCurrentSpaceId, (_, postId) => postId],
    (unseenComments, spaceId, postId) => {
        const spaceComments = unseenComments[spaceId] || {};
        return spaceComments[postId] || 0;
    }
)