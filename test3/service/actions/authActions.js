import { isValidToken } from "../../utils/authUtils";
import { refreshTokenAction } from "./refreshTokenAction";

import {
    CLEAR_MESSAGE,
    ERROR_MESSAGE,
    LOGOUT,
    SET_ACCESS_TOKEN,
    SET_REFRESH_TOKEN,
    SIGN_IN_SUCCESS, SIGN_UP_SUCCESS,
    SIGNIN_FAIL,
} from "../constants/authConstants";
import { logout, signIn, signUp } from "../api/authAPI";
import { getUserAction } from "./userActions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import Toast from "react-native-toast-message";
import {CONNECT_STOMP} from "../constants/stompConstants";
import {REGISTER_NOTIFICATION} from "../constants/appConstants";


export const initializeAuth = () => async (dispatch) => {
    try {
        const profile = JSON.parse(await AsyncStorage.getItem("profile"));
        const accessToken = profile?.access_token;
        const refreshToken = profile?.refresh_token;

        if (accessToken && refreshToken) {
            if (isValidToken(accessToken)) {
                dispatch(setAccessToken(accessToken));
                dispatch(setRefreshToken(refreshToken));
                await dispatch(getUserAction());
            } else {
                await dispatch(refreshTokenAction(refreshToken));

            }
        }
    } catch (error) {
        console.error("Failed to initialize authentication:", error);
    }
};

export const setAccessToken = (accessToken) => async (dispatch) => {
    dispatch({ type: SET_ACCESS_TOKEN, payload: accessToken });
};

export const setRefreshToken = (refreshToken) => async (dispatch) => {
    dispatch({ type: SET_REFRESH_TOKEN, payload: refreshToken });
};

export const setInitialAuthState = () => async (dispatch) => {
    await dispatch({ type: LOGOUT });
};

export const clearMessage = () => async (dispatch) => {
    dispatch({ type: CLEAR_MESSAGE });
};

export const logoutAction = () => async (dispatch) => {
    try {
        const { data } = await logout();
        await AsyncStorage.clear();
        await Updates.reloadAsync();
        dispatch({ type: LOGOUT, payload: data });
    } catch (error) {
        dispatch({ type: LOGOUT, payload: ERROR_MESSAGE });
    }
};

export const signUpAction = (userData, router, email) => async (dispatch) => {
    dispatch({ type: CLEAR_MESSAGE });
    try {
        await AsyncStorage.clear();
        const response = await signUp(userData);
        const { error } = response;

        if (error) {
            if (error?.code === "Validation failed") {
                Toast.show({type: "error", text1: error?.message})
            } else {
                Toast.show({type: "error", text1: error})
            }
        } else {
            Toast.show({
                type: "success",
                text1: "You have successfully created an account. Please verify your email."
            })
            router.replace({
                pathname: "/signup-verification",
                params: { email },
            });
        }
    } catch (error) {
        Toast.show({type: "error", text1: "Something went wrong"})
    }
};

export const signInAction = (formData, router) => async (dispatch) => {
    try {
        // Call the sign-in service
        const response = await signIn(formData);
        const { error, data } = response;

        // Handle error response
        if (error) {
            if (error?.code === "Validation failed") {
                Toast.show({ type: "error", text1: error?.message });
            } else {
                dispatch({ type: SIGNIN_FAIL, payload: error });
            }
            return; // Exit early on error
        }

        // Process successful response
        const { user, access_token, refresh_token } = data;

        if (!user || !access_token || !refresh_token) {
            console.error("Sign-in response missing necessary data:", data);
            dispatch({ type: SIGNIN_FAIL, payload: "Missing data" });
            return;
        }

        const profile = {
            user,
            access_token,
            refresh_token,
            isAuthenticated: true,
        };

        // Save profile to AsyncStorage
        await AsyncStorage.setItem(
            "profile",
            JSON.stringify({ ...data, user: user.userId })
        );

        // Dispatch success actions
        dispatch({ type: SIGN_IN_SUCCESS, payload: profile });

        // Ensure STOMP connection is established before subscribing
        await dispatch({ type: CONNECT_STOMP });

        // Dispatch the notification registration
        await dispatch({ type: REGISTER_NOTIFICATION });

        // Navigate to home page
        router.replace("/");
    } catch (error) {
        // Log and handle unexpected errors
        console.error("Error during sign-in:", error);
        dispatch({ type: SIGNIN_FAIL, payload: ERROR_MESSAGE });

        // Redirect to login page on failure
        router.replace("/login");
    }
};



export const signupVerificationAction = (data, router) => async (dispatch) => {
    try {
        const { user, access_token, refresh_token } = data;
        const profile = {
            user,
            access_token,
            refresh_token,
            isAuthenticated: true,
        };

        // Store profile in AsyncStorage
        await AsyncStorage.setItem(
            "profile",
            JSON.stringify({ ...data, user: user.userId })
        );

        // Dispatch actions
        dispatch({ type: SIGN_UP_SUCCESS, payload: profile });
        await dispatch({ type: CONNECT_STOMP });
        await dispatch({ type: REGISTER_NOTIFICATION });

        // Navigate to home page
        router.replace("/");
    } catch (error) {
        console.error("Error in signupVerificationAction:", error);
    }
};
