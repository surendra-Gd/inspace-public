import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REFRESH_TOKEN_FAIL, REFRESH_TOKEN_SUCCESS } from "../constants/authConstants";
import {BASE_URL} from "../api/utils";
import {connectStompClient} from "./stompActions";
import {CONNECT_STOMP} from "../constants/stompConstants";
import {REGISTER_NOTIFICATION} from "../constants/appConstants";


export const refreshTokenAction = (refreshToken) => async (dispatch) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/auth/refresh-token`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                },
            }
        );

        const profile = await AsyncStorage.getItem("profile");
        const profileData = profile ? JSON.parse(profile) : {};
        const access_token = response.data.access_token;


        await AsyncStorage.setItem("profile", JSON.stringify({ ...profileData, access_token }));
        
        dispatch({
            type: REFRESH_TOKEN_SUCCESS,
            payload: response.data,
        });
        dispatch({ type: CONNECT_STOMP });
        dispatch({ type: REGISTER_NOTIFICATION });

    } catch (error) {
        await AsyncStorage.clear();
        dispatch({
            type: REFRESH_TOKEN_FAIL,
            payload: error.response ? error.response.data : "Refresh token failed",
        });
    }
};