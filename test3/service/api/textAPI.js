import {handleApiError} from "./apiError";
import {SPACE_API} from "./utils";

export const getSpaceTexts = async (pageParam) => {
    try {
        const {data} = await SPACE_API.get(`/text?page=${pageParam}`);
        return {data, error: null}
    } catch (err) {
        return handleApiError(err);
    }
}

export const getTextMessages = async (pageParam, textId) => {
    try {
        const {data} = await SPACE_API.get(`/text/${textId}/messages?page=${pageParam}`);
        return {data, error: null}
    } catch (err) {
        return handleApiError(err);
    }
}

export const getStreaks = async (pageParam, memberId) => {
    try {
        const {data} = await SPACE_API.get(`/streak/${memberId}?page=${pageParam}`);
        return { data, error: null };
    } catch (err) {
        return handleApiError(err);
    }
}

export const getTextById = async(textId) => {
    try {
        const {data} = await SPACE_API.get(`/text/${textId}`);
        return {data, error: null}
    } catch (err) {
        return handleApiError(err);
    }
}