import {UPDATE_FRIEND_REQUESTS_SEEN} from "../service/constants/userConstants";
import {API, SPACE_API} from "../service/api/utils";
import {SET_UNSEEN_SPACE_REQUESTS, UPDATE_UNSEEN_SPACE_REQUESTS} from "../service/constants/spaceConstants";
import {ADD_SPACE} from "../service/constants/spaceConstants";

const backendMiddleware = (store) => (next) => async (action) => {
    if (action.type === UPDATE_FRIEND_REQUESTS_SEEN) {
        try {
            await API.put("friend-requests/seen");
        } catch (error) {
            console.error('Error updating friend requests', error);
        }
    } else if (action.type === ADD_SPACE) {
        next(action);
        if(action.meta.isAdmin) {
            try {
                const {data} = await SPACE_API.get("/space/count");
                store.dispatch({type: SET_UNSEEN_SPACE_REQUESTS, payload: data});
            } catch (error) {
                console.error("Error fetching unseen space requests", error);
            }
        }
    }  else if(action?.type === UPDATE_UNSEEN_SPACE_REQUESTS) {
        try {
            await SPACE_API.put("/space/mark-seen");
            next(action);
        } catch (error) {
            console.error("Error updating unseen space requests ", error);
        }
    }
    else {
        next(action);
    }

};

export default backendMiddleware;