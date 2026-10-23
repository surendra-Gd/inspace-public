import * as types from "../constants/authConstants";
import {SIGN_IN_SUCCESS, SIGN_UP_SUCCESS, SIGNIN_FAIL, UPDATE_USERNAME} from "../constants/authConstants";

const initialState = {
    isAuthenticated: false,
    userData: null,
    refreshToken: null,
    accessToken: null,
    signInError: null,
    signInSuccess: false,
}


export default function authReducer(state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
        case types.SET_USER_DATA:
            return {
                ...state,
                userData: payload ? payload.user : null,
                isAuthenticated: payload ? payload.isAuthenticated : false
            };
        case types.UPDATE_USER_DATA:
            return {
                ...state,
                userData: payload.user
            }
        case types.SET_ACCESS_TOKEN:
            return {
                ...state,
                accessToken: payload ? payload : null,
            };
        case types.SET_REFRESH_TOKEN:
            return {
                ...state,
                refreshToken: payload ? payload : null,
            };

        case types.SET_IS_AUTHENTICATED:
            return {
                ...state,
                isAuthenticated: payload ? payload : null,
            };

        case UPDATE_USERNAME:
        case SIGN_IN_SUCCESS:
        case SIGN_UP_SUCCESS:
            return {
                ...state,
                userData: payload ? payload.user : null,
                accessToken: payload ? payload.access_token : null,
                refreshToken: payload ? payload.refresh_token : null,
                isAuthenticated: payload ? payload.isAuthenticated : false,
                signInError: null,
                signInSuccess: true
            };

        case SIGNIN_FAIL:
            return {
                ...state,
                signInError: payload ? payload : null,
                signInSuccess: false
            };

        case types.LOGOUT:
            return {
                ...state,
                isAuthenticated: false,
                userData: null,
                refreshToken: null,
                accessToken: null,
                signInError: null,
                signInSuccess: false
            };

        case types.REFRESH_TOKEN_SUCCESS:
            return {
                ...state,
                isAuthenticated: !!payload,
                userData: payload ? payload.user : null,
                accessToken: payload ? payload.access_token : null,
                refreshToken: payload ? payload.refresh_token : null,
            };

        case types.REFRESH_TOKEN_FAIL:
            return {
                ...state,
                isAuthenticated: false,
                userData: null,
                refreshToken: null,
                accessToken: null,
                signInError: null,
                signInSuccess: false
            };

        case types.CLEAR_MESSAGE:
            return {
                ...state,
                signInError: null,
                signInSuccess: false
            };

        default:
            return state;
    }
}