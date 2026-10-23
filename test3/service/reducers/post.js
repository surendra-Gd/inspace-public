import {LOGOUT} from "../constants/authConstants";
import {
    ADD_EMOJI,
    ADD_POST,
    ADD_POST_COMMENT,
    ADD_REPLY,
    DELETE_POST_COMMENT,
    REMOVE_EMOJI, REMOVE_MEMBER,
    REMOVE_POST,
    REMOVE_REPLY,
    REMOVE_SPACE, SET_FEED,
    SET_POST, SET_POST_COMMENT_REPLIES,
    SET_POST_COMMENTS,
    SET_POST_RESPONSES,
    SET_POSTS
} from "../constants/spaceConstants";
import {DELETE_SPACE} from "../constants/userConstants";


const initialState = {
    posts: {},
    emojis: {},
    comments: {},
}

const postReducer = (state = initialState, action) => {

    switch (action.type) {

        case LOGOUT: {
            return {
                ...state,
                posts: {},
                emojis: {},
                comments: {}
            }
        }

        case SET_FEED: {
            const data = action.payload;

            const updatedPosts = {...state.posts};
            const updatedEmojis = {...state.emojis};

            data.forEach((item) => {
                const { post, emojis } = item;

                if (post && post.postId && !updatedPosts[post.postId]) {
                    updatedPosts[post.postId] = {
                        ...post,
                        isPostResponseFetched: true,
                        commentsPage: null
                    };
                }

                if (emojis && emojis.length) {
                    emojis.forEach((emoji) => {
                        if(!updatedEmojis[emoji.emojiId]) {
                            updatedEmojis[emoji.emojiId] = emoji;
                        }
                    })
                }
            });

            return {
                ...state,
                posts: updatedPosts,
                emojis: updatedEmojis
            }
        }

        case SET_POSTS: {
            const {posts} = action.payload;

            const updatedPosts = {...state.posts};

            posts?.forEach(post => {
                if (!updatedPosts[post.postId]) {
                    updatedPosts[post.postId] = {
                        ...post,
                        isPostResponseFetched: false,
                        commentsPage: null
                    };
                }
            });

            return {
                ...state,
                posts: updatedPosts,
            };
        }

        // Todo: see in later.
        case SET_POST_RESPONSES: {
            const {emojis, comments, page, postId} = action.payload;
            const normalizeData = (items, stateKey) =>
                items ? {
                    ...state[stateKey], ...items.reduce((acc, item) => ({
                        ...acc,
                        [item.id || item.emojiId]: item
                    }), {})
                } : state[stateKey];

            const updatedComments = {...state.comments};

            comments?.forEach(comment => {
                if (!updatedComments[comment.commentId]) {
                    updatedComments[comment.commentId] = {
                        ...comment,
                        repliesPage: null
                    };
                }
            });

            return {
                ...state,
                posts: {
                    ...state.posts,
                    [postId]: {
                        ...state.posts[postId],
                        isPostResponseFetched: true,
                        commentsPage: page
                    },
                },
                emojis: normalizeData(emojis, "emojis"),
                comments: updatedComments,
            };
        }

        // Todo: This will retrieving the comments again.
        case ADD_POST: {
            const {postId} = action.payload;
            return {
                ...state,
                posts: {
                    ...state.posts,
                    [postId]: {
                        ...action.payload,
                        isPostResponseFetched: true,
                        commentsPage: null,
                    }
                }
            };
        }

        // Todo: SET_POST and ADD_POST seems like similar
        case SET_POST: {
            const {postId} = action.payload;
            return {
                ...state,
                posts: {
                    ...state.posts,
                    [postId]: {
                        ...action.payload,
                        isPostResponseFetched: false,
                        commentsPage: null
                    }
                }
            };
        }

        // Todo: remove everything on post side.
        case REMOVE_POST: {
            const {postId} = action.payload;

            const {[postId]: removedPost, ...remainingPosts} = state.posts;

            const updatedEmojis = Object.keys(state.emojis)
                .filter(emojiId => state.emojis[emojiId].postId !== postId)
                .reduce((acc, emojiId) => ({
                    ...acc,
                    [emojiId]: state.emojis[emojiId]
                }), {});

            const updatedComments = Object.keys(state.comments)
                .filter(commentId => state.comments[commentId].postId !== postId)
                .reduce((acc, commentId) => ({
                    ...acc,
                    [commentId]: state.comments[commentId]
                }), {});

            return {
                ...state,
                posts: remainingPosts,
                emojis: updatedEmojis,
                comments: updatedComments
            };
        }

        // add in emojis and change member emoji in that post
        // Todo: Member Emoji is removed.
        case ADD_EMOJI: {
            const emoji = action.payload;
            return {
                ...state,
                emojis: {
                    ...state.emojis,
                    [emoji.emojiId]: emoji
                },
            };
        }

        // remove on emojis and change to member emojis in that post
        // Todo: Same as removed member emoji and retrieve all emojis at once.
        case REMOVE_EMOJI: {
            const emojiId = action.payload;
            const {[emojiId]: removedEmoji, ...remainingEmojis} = state.emojis
            return {
                ...state,
                emojis: remainingEmojis
            };
        }

        case DELETE_SPACE:
        case REMOVE_SPACE: {
            const spaceId = action.payload;

            if (!spaceId) return state;

            const filterEntitiesBySpaceId = (entities, spaceId) => {
                return Object.keys(entities).reduce((acc, entityId) => {
                    const entity = entities[entityId];
                    if (entity.spaceId !== spaceId) {
                        acc[entityId] = entity;
                    }
                    return acc;
                }, {});
            };

            const updatedPosts = filterEntitiesBySpaceId(state.posts, spaceId);
            const updatedEmojis = filterEntitiesBySpaceId(state.emojis, spaceId);
            const updatedComments = filterEntitiesBySpaceId(state.comments, spaceId);

            return {
                ...state,
                posts: updatedPosts,
                emojis: updatedEmojis,
                comments: updatedComments
            };
        }

        case REMOVE_MEMBER: {
            const {memberId} = action.payload;

            if(!memberId) return state;

            const filterEntitiesByMemberId = (entities, memberId) => {
                return Object.keys(entities).reduce((acc, entityId) => {
                    const entity = entities[entityId];
                    if (entity.memberId !== memberId) {
                        acc[entityId] = entity;
                    }
                    return acc;
                }, {});
            };

            const updatedPosts = filterEntitiesByMemberId(state.posts, memberId);
            const updatedEmojis = filterEntitiesByMemberId(state.emojis, memberId);
            const updatedComments = filterEntitiesByMemberId(state.comments, memberId);

            return {
                ...state,
                posts: updatedPosts,
                emojis: updatedEmojis,
                comments: updatedComments,
            }
        }

        // Todo: we tackled comment count in post later.
        case ADD_POST_COMMENT: {
            const comment = action.payload;

            if (!state.posts[comment.postId]) {
                return state;
            }
            return {
                ...state,
                comments: {
                    ...state.comments,
                    [comment.commentId]: {...comment, repliesPage: null}
                }
            }
        }

        // Todo: Those are pagination that's why we maintain count in their parent.
        case ADD_REPLY: {
            const reply = action.payload;
            if (!state.comments[reply.parentId]) {
                return state;
            }
            const updatedRepliesCount = state.comments[reply.parentId].replyCount + 1;
            return {
                ...state,
                comments: {
                    ...state.comments,
                    [reply.parentId]: {
                        ...state.comments[reply.parentId],
                        replyCount: updatedRepliesCount,
                        lastUpdatedOn: reply.commentedOn,
                    },
                    [reply.commentId]: reply
                }
            };
        }

        case REMOVE_REPLY: {
            const replyId = action.payload;
            if (!state.comments[replyId]) {
                return state;
            }
            const {parentId} = state.comments[replyId];
            const updatedRepliesCount = state.comments[parentId].replyCount - 1;

            const {[replyId]: removedReply, ...remainingComments} = state.comments;

            return {
                ...state,
                comments: {
                    ...remainingComments,
                    [parentId]: {
                        ...state.comments[parentId],
                        replyCount: updatedRepliesCount
                    }
                }
            };
        }

        // Todo: update post on commentCount
        case DELETE_POST_COMMENT: {
            const commentId = action.payload;

            // If the comment doesn't exist, return the state unchanged
            if (!state.comments[commentId]) {
                return state;
            }

            // Destructure to remove the comment by key
            const { [commentId]: removedComment, ...remainingComments } = state.comments;

            // Remove any replies that have the deleted comment as their parent
            const filteredComments = Object.keys(remainingComments).reduce((acc, key) => {
                const comment = remainingComments[key];
                if (comment?.parentId !== commentId) {
                    acc[key] = comment;
                }
                return acc;
            }, {});

            return {
                ...state,
                comments: filteredComments,
            };
        }

        case SET_POST_COMMENTS: {
            const { comments: newComments, page, postId } = action.payload;

            const updatedComments = newComments?.reduce((acc, comment) => {
                acc[comment.commentId] = comment;
                return acc;
            }, { ...state.comments }) || state.comments;

            const updatedPosts = {
                ...state.posts,
                [postId]: {
                    ...state.posts[postId],
                    commentsPage: page,
                },
            };

            return {
                ...state,
                comments: updatedComments,
                posts: updatedPosts,
            };
        }

        case SET_POST_COMMENT_REPLIES: {
            const { replies: comments, page, commentId } = action.payload;

            // Normalize replies into the comments object
            const updatedComments = comments?.reduce(
                (acc, comment) => ({
                    ...acc,
                    [comment.commentId]: {
                        ...acc[comment.commentId],
                        ...comment,
                    },
                }),
                { ...state.comments }
            ) || state.comments;

            // Update the main comment with repliesPage
            if (updatedComments[commentId]) {
                updatedComments[commentId] = {
                    ...updatedComments[commentId],
                    repliesPage: page, // Set or update the repliesPage attribute
                };
            }

            return {
                ...state,
                comments: updatedComments,
            };
        }



        default:
            return state;
    }
}

export default postReducer;