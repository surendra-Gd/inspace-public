import axios from 'axios';
import { getStore } from "../store";
import {
    AUTH_HEADER,
    MEMBER_ID_HEADER,
    SPACE_AUTH_HEADER,
    SPACE_ID_HEADER
} from "../constants/appConstants";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = "https://api.theinspace.net/api/v1";


const createAxiosInstance = (baseURL) => {
    const instance = axios.create({ baseURL });

    instance.interceptors.request.use(async (config) => {
        // Retrieve access token from AsyncStorage
        const accessToken = JSON.parse(await AsyncStorage.getItem('profile'))?.access_token;
        const spaceToken = await AsyncStorage.getItem('x-ps');

        if (accessToken) {
            config.headers[AUTH_HEADER] = `Bearer ${accessToken}`;
        }
        if (config.baseURL.includes('in-space')) {
            const store = await getStore();
            const space = store?.getState()?.space;

            const { spaces, currentSpaceId } = space;
            const memberId = spaces[currentSpaceId]?.currentMember?.memberId;

            if (spaceToken) {
                config.headers[SPACE_AUTH_HEADER] = spaceToken;
            }
            if (memberId) {
                config.headers[MEMBER_ID_HEADER] = memberId;
            }
            if (currentSpaceId) {
                config.headers[SPACE_ID_HEADER] = currentSpaceId;
            }
        }
        return config;
    });
    return instance;
};

export const API = createAxiosInstance(BASE_URL);
export const SPACE_API = createAxiosInstance(`${BASE_URL}/in-space`);

SPACE_API.interceptors.response.use(
    async (response) => {
        try {
            const spaceToken = response.headers[SPACE_AUTH_HEADER];
            if (spaceToken) {
                await AsyncStorage.setItem('x-ps', spaceToken);
            }
            return response;
        } catch (error) {
            throw new Error(error);
        }
    }
);