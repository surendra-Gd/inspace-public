import { API } from "./utils";
import {handleApiError} from "./apiError";


export const signIn = async (request) => {
    try {
        const {data} = await API.post("auth/authenticate", request);
        return { error: null, data };
    } catch (error) {
        return handleApiError(error);
    }

};

export const signUp = async (user) => {
    try {
        const { data } = await API.post("/auth/register", user);
        return { error: null, data };
    } catch (error) {
        return handleApiError(error);
    }
};

export const logout = async () => {
    try {
        const { data } = await API.post("/auth/logout", {}, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return { error: null, data };
    } catch (error) {
        return handleApiError(error);
    }
};