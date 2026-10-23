import {getStore} from "../store";
import {setError} from "../actions/appActions";
import {NETWORK_ERROR} from "../constants/appConstants";

export const handleApiError = async (error) => {
    try {
        const store = await getStore();
        if (error.response) {
            const res = error.response.data;
            // console.log("response-error: ", res);
            if (res?.status === 400 && res?.error === "Validation failed") {
                return {
                    error: {
                        code: "Validation failed",
                        message: res?.validationErrors?.[0] || "Validation error occurred",
                    },
                    data: null
                };
            }
            const errorMessage = res?.message || "Something went wrong. Please try later.";
            return { error: errorMessage, data: null };

        } else if (error.request) {
            // console.log("response-error: ", error.request);
            await store.dispatch(setError("network", NETWORK_ERROR));
        } else {
            return { error: error.message || "Unexpected error occurred", data: null };
        }
    } catch (err) {
        return { error: "Unexpected error occurred", data: null };
    }
};