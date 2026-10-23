import {createSelector} from 'reselect';
import moment from "moment";

export const getCurrentSpaceId = (state) => state?.space?.currentSpaceId;
const getSpaces = (state) => state?.space?.spaces || {};
const getMembers = (state) => state?.space.members;
const getPosts = (state) => state?.post.posts || {};
const getEmojis = (state) => state?.post.emojis || {};
const getComments = (state) => state?.post.comments || {};
const getTexts = (state) => state.text.texts || {};
const getTextMessages = (state) => state.text.textMessages || {};
const selectUnseenMessages = (state) => state.text.unseenMessages;
const getStreaks = (state) => state.text.streaks;
const getUnseenRequests = (state) => state.space?.unseenSpaceRequests;



const isToday = (date) => moment(date).isSame(moment(), 'day');

export const getCurrentSpace = createSelector(
    [getCurrentSpaceId, getSpaces],
    (currentSpaceId, spaces) => {
        return currentSpaceId && spaces ? spaces[currentSpaceId] : null;
    }
);

export const selectCurrentMember = createSelector(
    [getCurrentSpaceId, getSpaces, getMembers],
    (currentSpaceId, spaces, members) => {
        const currentMemberId = spaces[currentSpaceId]?.currentMember.memberId;
        return members[currentMemberId];
    }
)

export const selectCurrentMemberId = createSelector(
    [getSpaces, (_, spaceId) => spaceId],
    (spaces, spaceId) => {
        return spaces?.[spaceId]?.currentMember?.memberId;
    }
)


export const getUnseenRequestsCount = createSelector(
    [getUnseenRequests, getCurrentSpaceId],
    (unseenRequests, spaceId) => unseenRequests?.[spaceId] ?? 0
);

export const selectUnseenMessageCountBySpaceId = createSelector(
    [selectUnseenMessages, getCurrentSpaceId],
    (unseenMessages, spaceId) => {
        const spaceMessages = unseenMessages[spaceId] || {};
        return Object.values(spaceMessages).reduce((total, count) => total + count, 0);
    }
);

export const getTextById = createSelector(
    [getTexts, (_, textId) => textId],
    (texts, textId) => texts[textId]
);


export const selectCommentByCommentId = createSelector(
    [getComments, (_, commentId) => commentId],
    (comments, commentId) => comments[commentId] || {}
)

export const selectPostById = createSelector(
    [getPosts, (_, postId) => postId],
    (posts, postId) => posts[postId] || null
)

export const getStreaksByMemberId = createSelector(
    [getStreaks, (_, memberId) => memberId],
    (streaks, memberId) =>
        Object.values(streaks).filter((streak) => streak?.memberId === Number(memberId))
);

const getTextsBySpaceId = createSelector(
    [getTexts, (_, spaceId) => spaceId],
    (texts, spaceId) =>
        Object.values(texts).filter((text) => text?.spaceId === spaceId)
);

export const getSpaceTextsSelector = createSelector(
    [getTextsBySpaceId],
    (filteredTexts) =>
        [...filteredTexts].sort(
            (a, b) => new Date(b?.lastUpdatedOn) - new Date(a?.lastUpdatedOn)
        )
);


const getTextMessagesByTextId = createSelector(
    [getTextMessages, (_, textId) => textId],
    (textMessages, textId) =>
        Object.values(textMessages).filter((message) => message?.textId === textId)
)

export const getSortedTextMessages = createSelector(
    [getTextMessagesByTextId],
    (filteredTextMessages) =>
        [...filteredTextMessages].sort(
            (a, b) => new Date(a?.timeStamp) - new Date(b?.timeStamp)
        )
);




export const selectMembersByIds = createSelector(
    [getMembers, (state, memberIds) => memberIds || []],
    (membersById, memberIds) => {
        if (!Array.isArray(memberIds)) return [];
        return memberIds.map(id => membersById[id] || null).filter(Boolean);
    }
);


export const getEmojisByPostId = createSelector(
    [getEmojis, (_, postId) => postId, (_, __, currentMemberId) => currentMemberId, getMembers],
    (emojis, postId, currentMemberId, members) => {
        let response = Object.values(emojis).filter(emoji => emoji.postId === postId) || [];

        // Filter out emojis whose emojiMember is not a key in the members object
        response = response.filter(emoji => members[emoji.emojiMember]);

        return response.length > 0
            ? response.sort((a, b) => (
                a.emojiMember === currentMemberId ? -1 : b.emojiMember === currentMemberId ? 1 : 0)
            )
            : [];
    }
);



export const selectMemberById = createSelector(
    [getMembers, (state, memberId) => memberId], // Input selectors
    (members, memberId) => members[memberId]  // Result function
);


export const selectCommentsByPostId = createSelector(
    [getComments, (state, postId) => postId],
    (comments, postId) => {
        return (
            Object.values(comments)
                .filter(
                    (comment) =>
                        comment.postId === postId && comment.commentType === "COMMENT"
                )
                .sort((a, b) => new Date(b.lastUpdatedOn) - new Date(a.lastUpdatedOn)) // Sort by latest updated date
        ) || [];
    }
);

export const selectPostsByMemberId = createSelector(
    [getPosts, (state, memberId) => memberId],
    (posts, memberId) => {
        const safePosts = posts || {};
        return Object.values(safePosts)
            .filter((post) => post.memberId === memberId)
            .sort((a, b) => {
                const dateA = new Date(a.sharedOn).getTime() || 0;
                const dateB = new Date(b.sharedOn).getTime() || 0;
                return dateB - dateA; // Descending order
            });
    }
);



export const selectRepliesByCommentId = createSelector(
    [getComments, (state, parentId) => parentId],
    (comments, parentId) => {
        return Object.values(comments).filter(comment =>
            comment.parentId === parentId && comment.commentType === "REPLY"
        ).sort((a, b) => new Date(b.lastUpdatedOn) - new Date(a.lastUpdatedOn));
    }
)


export const selectEmojiByMemberId = createSelector(
    [
        getEmojis,
        (state, memberId) => memberId,
        (state, memberId, postId) => postId
    ],
    (emojis, memberId, postId) =>
        Object.values(emojis).find(
            (emoji) => emoji.emojiMember === memberId && emoji.postId === postId
        ) || null // Return `null` if no matching emoji is found
);




export const getActivities = (state, spaceId) => {
    const space = getSpaceById(state, spaceId);
    return space ? space.activities : null;
};

// Selector to get requests in a space
export const getRequestsInSpace = (state, spaceId) => {
    const space = getSpaceById(state, spaceId);
    return space ? space.requests : null;
};


// Selector to get a space by ID
export const getSpaceById = (state, spaceId) => {
    const spaces = getSpaces(state);
    return spaces[spaceId];
};

export const selectSpaceMembers = createSelector(
    [getMembers, getCurrentSpaceId],
    (members, currentSpaceId) => {
        if (!currentSpaceId || typeof members !== "object") return [];
        return Object.values(members).filter(member => member?.spaceId === currentSpaceId);
    }
);

export const selectSortedSpaceMembers = createSelector(
    [getMembers, getCurrentSpaceId],
    (members, currentSpaceId) => {
        if (!members || !currentSpaceId) return [];

        const spaceMembers = Object.values(members).filter(member => member?.spaceId === currentSpaceId);

        return spaceMembers.sort((a, b) => {
            if (a.userOnline && !b.userOnline) return -1; // Online users come first
            if (!a.userOnline && b.userOnline) return 1;

            return b.streak - a.streak; // Then sort by streak
        });
    }
);


export const selectSpaceMembersObj = createSelector(
    [getMembers, getCurrentSpaceId],
    (members, currentSpaceId) => {
        if (!currentSpaceId || typeof members !== "object") return {};
        return Object.entries(members).reduce((result, [key, member]) => {
            if (member?.spaceId === currentSpaceId) {
                result[key] = member;
            }
            return result;
        }, {});
    }
);


export const selectPostsBySpaceAndToday = createSelector(
    [getPosts, getCurrentSpaceId],
    (posts, currentSpaceId) =>
        Object.values(posts).filter(
            (post) => post.spaceId === currentSpaceId && isToday(post.sharedOn)
        ).sort((a, b) => moment(b.sharedOn).diff(moment(a.sharedOn))) || []
);