import {jwtDecode} from "jwt-decode";

/**
 * Check if a token is valid based on its expiration time.
 * @param {string} token - The token to check.
 * @returns {boolean} True if the token is valid, false otherwise.
 */
const isValidToken = (token) => {
    if (!token) {
        return false;
    }

    try {
        const decodedPayload = jwtDecode(token);
        const expiryTime = decodedPayload.exp * 1000;
        const currentTime = Date.now();

        return expiryTime > currentTime;
    } catch (error) {
        console.error("Failed to decode token:", error);
        return false;
    }
};

export { isValidToken };
