// Todo get user Id or

import {createSelector} from "reselect";

const currentUser = (state) => state?.user?.userData;
const incomingRequests = (state) => state.user.incomingRequests;

export const selectCurrentUserId = createSelector(
    [currentUser],
    (user) => user?.userId
);

export const getUnseenRequestCount = createSelector(
    [incomingRequests],
    (incomingRequests) => {
        if(incomingRequests.length === 0) return null;
        return incomingRequests?.filter(request => !request.seen).length;
    }
);