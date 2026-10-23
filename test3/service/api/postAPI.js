import {SPACE_API} from "./utils";
import {handleApiError} from "./apiError";
import {EMOJI_FOUND, EMOJI_NOT_FOUND, UNAUTHORIZED_ACCESS} from "../constants/apiErrorConstants";
import Toast from "react-native-toast-message";

export const getFeed = async () => {
    try {
        const {data} = await SPACE_API.get(`/posts/feed`);
        return {error: null, data};
    } catch (error) {
        return handleApiError(error);
    }
};

export const getPost = async (postId) => {
    try {
        const {data} = await SPACE_API.get(`/posts/${postId}`);
        return {error: null, data};
    } catch (error) {
        return handleApiError(error);
    }
}

export const getPostCount = async () => {
    try {
        const {data} = await SPACE_API.get("/posts/today-count"); // Ensure consistent path
        return {error: null, data};
    } catch (error) {
        return handleApiError(error);
    }
};

export const uploadPost = async (spaceId, memberId, formData) => {
    try {
        const {data} = await SPACE_API.post("/posts/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return {error: null, data};
    } catch (error) {
        return handleApiError(error);
    }
};

export const deletePost = async (postId) => {
    try {
        const {data} = await SPACE_API.delete(`/posts/${postId}`);
        return {error: null, data};
    } catch (error) {
        return handleApiError(error); // Ensure to return here
    }
};

export const getMemberPosts = async (memberId, pageParam) => {
    try {
        const {data} = await SPACE_API.get(`/posts/member/${memberId}?page=${pageParam}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {error: null, data};
    } catch (error) {
        return handleApiError(error);
    }
};


export const addEmoji = async (payload) => {
    try {
        const {data} = await SPACE_API.post("/emojis/add", payload);
        return {error: null, data};
    } catch (err) {
        if (err.response) {
            const {status, error, response, message} = err?.response?.data;
            if (status === 302 && error === EMOJI_FOUND) {
                return {"emojiFound": true, data: response};
            } else if (status === 403 && message === UNAUTHORIZED_ACCESS) {
                return {"unAuthorizedAccess": true, data: null};
            }
        } else {
            return handleApiError(err);
        }
    }
};

export const removeEmoji = async (emojiId) => {
    try {
        const {data} = await SPACE_API.delete(`/emojis/${emojiId}`);
        return {error: null, data};
    } catch (error) {
        if (error.response) {
            const {status, message} = error?.response?.data;
            if (status === 404 && message === EMOJI_NOT_FOUND) {
                Toast.show({type: "error", text1: "We could not find that emoji."});
                return {error: null, data: null};
            } else if (status === 403 && message === UNAUTHORIZED_ACCESS) {
                Toast.show({type: "error", text1: "You do not have permission to remove the emoji."});
                return {error: null, data: null};
            }
        } else {
            return handleApiError(error);
        }
    }
};

export const getPostComments = async (postId, pageParam) => {
    try {
        const {data} = await SPACE_API.get(`/posts/${postId}/comments?page=${pageParam}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {error: null, data};
    } catch (error) {
        return handleApiError(error);
    }
}

export const getPostResponses = async (postId) => {
    try {
        const {data} = await SPACE_API.get(`/posts/responses/${postId}`);
        return {error: null, data};
    } catch (error) {
        return handleApiError(error);
    }
}


export const getCommentReplies = async (commentId, pageParam) => {
    try {
        const {data} = await SPACE_API.get(`/posts/replies/${commentId}?page=${pageParam}`);
        return {error: null, data};
    } catch (error) {
        return handleApiError(error);
    }
}