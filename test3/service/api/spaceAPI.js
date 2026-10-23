import {API, SPACE_API} from "./utils";
import {
    REQUEST_USED,
    SPACE_MEMBER_EXISTS_EXCEPTION,
    SPACE_REQUEST_FOUND_EXCEPTION,
    SPACE_REQUEST_NOT_FOUND_EXCEPTION, UNAUTHORIZED_ACCESS
} from "../constants/apiErrorConstants";
import {handleApiError} from "./apiError";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";


export const getSpaceMembers = async () => {
    try {
        const {data} = await SPACE_API.get(`/members`);
        return {error: null, data}
    } catch (error) {
        return handleApiError(error)
    }
}

export const getSpaceMember = async (memberId) => {
    try {
        const {data} = await SPACE_API.get(`/members/${memberId}`);
        return {error: null, data}
    } catch (error) {
        return handleApiError(error)
    }
}


export const getCurrentSpace = async (spaceId) => {
    try {
        const {data} = await API.get(`in-space/space/${spaceId}/current`);
        return {error: null, data};
    } catch (error) {
        if (error.response) {
            let response = error?.response?.data;
            if (response?.status === 403 || response?.status === 404) {
                return {error: response, data: null}
            }
        }
        return handleApiError(error);

    }
}


export const leaveSpace = async (spaceId, memberId, feedback) => {
    const request = {memberId, spaceId, feedback}
    await AsyncStorage.removeItem('x-ps');
    try {
        const {data} = await API.put("in-space/space/leave", request);
        return {error: null, data}
    } catch (error) {
        return handleApiError(error);
    }
}


export const getActivities = async ({pageParam}) => {
    try {
        const {data} = await SPACE_API.get(`activities?page=${pageParam}`);
        return {error: null, data};
    } catch (error) {
        return handleApiError(error);
    }
}


export const getSpaceRequests = async () => {
    try {
        const {data} = await SPACE_API.get("/space/requests");
        return {error: null, data}
    } catch (error) {
        return handleApiError(error);
    }
}


export const handleSpaceRequest = async (payload, username) => {
    try {
        const {data} = await SPACE_API.post("space/requests/handle", payload);
        return {error: null, data}
    } catch (error) {
        if (error.response) {
            const {status, message} = error?.response?.data || {};
            if (status === 404 && message === SPACE_REQUEST_NOT_FOUND_EXCEPTION) {
                Toast.show({type: "error", text1: "We not found request with " + username})
                return {"requestNotFound": true, data: null}
            } else if (status === 403 && message === UNAUTHORIZED_ACCESS) {
                Toast.show({type: "error", text1: "You do not have permission to remove this request."});
                return {"unAuthorizedAccess": true, data: null}
            } else if (status === 400 && message === REQUEST_USED) {
                Toast.show({type: "error", text1: "Request is already processed."});
                return {"requestUsed": true, data: null}
            }
        }
        return handleApiError(error);
    }
}


export const getUserSpaces = async () => {
    try {
        const {data} = await API.get("in-space/space/mine");
        return {error: null, data};
    } catch (error) {
        return handleApiError(error);
    }
}


export const getMemberCount = async (spaceId) => {
    try {
        const {data} = await API.get(`in-space/space/${spaceId}/members/count`);
        return {error: null, data}
    } catch (error) {
        return handleApiError(error);
    }
}


export const deleteSpace = async (request) => {
    try {
        await AsyncStorage.removeItem('x-ps');
        const {data} = await API.put("in-space/space/delete", request);
        return {error: null, data};
    } catch (error) {
        return handleApiError(error);
    }
}


export const getSpaceByUniqueId = async (uniqueId) => {
    try {
        const {data} = await API.get(`/in-space/space/${uniqueId}`)
        return {error: null, data};
    } catch (err) {
        return handleApiError(err);
    }
}


export const getSpaceRequestStatus = async (spaceId) => {
    try {
        const {data} = await API.get(`/space-requests/${spaceId}/status`);
        return {error: null, data};
    } catch (error) {
        return handleApiError(error);
    }
}


export const addSpaceRequest = async (spaceId) => {
    try {
        const {data} = await API.post(`/space-requests/${spaceId}/add`)
        return {error: null, data};
    } catch (err) {
        if (err.response) {
            const {status, error, response} = err?.response?.data || {};
            if (status === 409 && error === SPACE_REQUEST_FOUND_EXCEPTION) {
                return {"spaceRequestFound": true, data: response}
            } else if (status === 302 && error === SPACE_MEMBER_EXISTS_EXCEPTION) {
                return {"spaceMemberExists": true, data: response}
            }
        }
        return handleApiError(err);
    }
}


export const removeSpaceRequest = async (requestId, uniqueId) => {
    try {
        const {data} = await API.delete(`/space-requests/${requestId}/remove`)
        return {error: null, data};
    } catch (error) {
        if (error.response) {
            const {status, message,} = error?.response?.data;
            if (status === 404 && message === SPACE_REQUEST_NOT_FOUND_EXCEPTION) {
                Toast.show({type: "error", text1: "We not found request with " + uniqueId})
                return {error: null, data: null}
            } else if (status === 403 && message === UNAUTHORIZED_ACCESS) {
                Toast.show({type: "error", text1: "You do not have to remove this request."});
                return {error: null, data: null}
            } else if (status === 400 && message === REQUEST_USED) {
                Toast.show({type: "error", text1: "Request is already processed."});
                return {error: null, data: null}
            }
        }
        return handleApiError(error);
    }
}


export const getMemberById = async (memberId) => {
    try {
        const {data} = await SPACE_API.get(`members/${memberId}`);
        return {error: null, data}
    } catch (err) {
        if (err.response) {
            const {error, status, message} = err?.response?.data || {};
            if ((error === "Resource not found" && status === 404 && message === "Member not found") ||
                (error === "UnAuthorized Access" && status === 403 && message === "No Permission")) {
                throw new Error("Member Not Found");
            }
        }
        return handleApiError(err)
    }
}


export const shiftAdmin = async (memberId) => {
    try {
        const {data} = await SPACE_API.put(`space/shift-admin?target=${memberId}`);
        return {error: null, data};
    } catch (error) {
        return handleApiError(error);
    }
}


export const removeMember = async (request) => {
    try {
        const {data} = await SPACE_API.put("/space/remove", request);
        return {error: null, data}
    } catch (err) {
        if (err.response) {
            const res = err?.response?.data;
            if (res?.status === 400 && res?.error === "Operation Failed") {
                Toast.show({type: "error", text1: res?.message});
                return {operationFailed: true, error: null, data: null}
            }
        }
        return handleApiError(err);
    }
}