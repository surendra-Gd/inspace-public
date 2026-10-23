import { combineReducers } from "redux";

import authReducer from "./auth";
import userReducer from "./user";
import spacesReducer from "./space";
import appReducer from "./app";
import stompReducer from "./stomp";
import {textReducer} from "./text";
import postReducer from "./post";

const rootReducer = combineReducers({
    app: appReducer,
    auth: authReducer,
    user: userReducer,
    space: spacesReducer,
    stomp: stompReducer,
    text: textReducer,
    post: postReducer
});

export default rootReducer;