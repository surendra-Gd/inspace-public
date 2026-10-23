import {API} from "./utils";
import {handleApiError} from "./apiError";
import {
  FRIENDS_NOT_FOUND,
  INVALID_STATUS,
  REQUEST_NOT_FOUND,
  REQUEST_USED,
  UNAUTHORIZED_ACCESS
} from "../constants/apiErrorConstants";
import Toast from "react-native-toast-message";



export const getUser = async() => {
  try {
    const {data} = await API.get("users/me");
    return { error: null, data }
  } catch (error) {
    if(error.response) {
      if (error?.response?.status === 401) {
        return {error: "unauthorized", data: null}
      } else if (error?.response?.status === 403) {
        return {error: "forbidden", data: null}
      }
    }
    return handleApiError(error);
  }
}



export const getUserByUsername = async(username) => {
  try {
    const { data } = await API.get(`/users/${username}`);
    return { error: null, data };
  } catch (error) {
    return handleApiError(error)
  }
}


export const getSuggestingUsers = async ({pageParam}) => {
  try {
    const { data } = await API.get(`/friends/suggestions?page=${pageParam}`);
    return { error: null, data };
  }
  catch(error) {
    return handleApiError(error);
  }
}


export const getUserFriends = async() => {
  try {
    const { data } = await API.get("/friends/current");
    return { error: null, data };
  }
  catch(error) {
    return handleApiError(error)
  }
}


export const getFriendInfo = async(userId) => {
  try {
    const { data } = await API.get(`/friends/${userId}/profile`);
    return { error: null, data };
  }
  catch(error) {
    return handleApiError(error);
  }
}


export const handleFriendRequest = async(payload, username) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const { data } = await API.post("/friend-requests/handle", payload, config);
    return { error: null, data };
  }
  catch (error) {
    if(error.response) {
      const {status, message,} = error?.response?.data || {};
      if (status === 404 && message === REQUEST_NOT_FOUND) {
        Toast.show({type: "error", text1: "We could not find the friend request with " + username});
        return {"requestNotFound": true, data: null}
      } else if (status === 403 && message === UNAUTHORIZED_ACCESS) {
        Toast.show({type: "error", text1: "You do not have the permissions to remove this request"});
        return {"unAuthorizedAccess": true, data: null}
      } else if (status === 400 && message === REQUEST_USED) {
        Toast.show({type: "error", text1: "This request already processed"})
        return {"requestUsed": true, data: null}
      } else if (status === 400 && message === INVALID_STATUS) {
        return {"invalidStatus": true, data: null}
      }
    }
    return handleApiError(error);
  }
}


export const addFriendRequest = async(id) => {
  try {
    const { data } = await API.post(`friend-requests/add/${id}`);
    Toast.show({type: "success", text1: "Request Added successfully"})
    return { error: null, data };
  }
  catch (err) {
    if(err.response) {
      const {status, error, response} = err?.response?.data || {};
      if (status === 302 && error === "Outgoing Request Found") {
        Toast.show({type: "success", text1: "You already send request to that user."})
        return {"OutgoingRequest": true, data: response}
      } else if (status === 409 && error === "Incoming Request Found") {
        return {"IncomingRequest": true, data: response}
      } else if (status === 302 && error === "Friends Found") {
        return {"FriendsFound": true, data: response}
      }
    }
    return handleApiError(err);

  }
}



export const removeFriendRequest = async(requestId, username) => {
  try {
    const { data } = await API.delete(`/friend-requests/remove/${requestId}`);
    Toast.show({type: "success", text1: "Request removed successfully"});
    return { error: null, data };
  }
  catch(error) {
    if(error.response) {
      const {status, message} = error?.response?.data || {};
      if (status === 404 && message === REQUEST_NOT_FOUND) {
        Toast.show({type: "error", text1: "We could not find the friend request with " + username});
        return {error: null, data: null}
      } else if (status === 403 && message === UNAUTHORIZED_ACCESS) {
        Toast.show({type: "error", text1: "You do not have the permissions to remove this request."})
        return {error: null, data: null}
      } else if (status === 400 && message === REQUEST_USED) {
        Toast.show({type: "error", text1: "This request already processed."})
        return {error: null, data: null}
      }
    }
    return handleApiError(error);
  }
}


export const unfriend = async (friendsId, username) => {
  try {
    const {data} = await API.delete(`/friends/${friendsId}`);
    return {error: null, data}
  } catch (error) {
    if(error.response) {
      const {status, message} = error?.response?.data || {};
      if (status === 404 && message === FRIENDS_NOT_FOUND) {
        Toast.show({type: "error", text1: "You are not friendship with " + username});
        return {error: null, data: null}
      } else if (status === 403 && message === UNAUTHORIZED_ACCESS) {
        Toast.show({type: "error", text1: "You do not have the permissions."});
        return {error: null, data: null}
      }
    }
    return handleApiError(error);
  }
}


export const getUserRequest = async(userId) => {
  try {
    const { data } = await API.get(`/friend-requests/status/${userId}`);
    return { error: null, data };
  } catch(error) {
    return handleApiError(error);
  }
}


export const getMutualRequests = async() => {
  try {
    const { data } = await API.get("/friend-requests/mutual");
    return {error: null, data}
  } catch (error) {
    return handleApiError(error);
  }
}

