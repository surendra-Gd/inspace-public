import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers/root";
import { initializeAuth } from "./actions/authActions";
import { tokenMiddleware } from "../middlewares/tokenMiddleware";
import websocketMiddleware from "../middlewares/websocketMiddleware";
import notificationMiddleware from "../middlewares/notificationMiddleware";
import backendMiddleware from "../middlewares/backendMiddleware";

let store;

const createAppStore = async () => {
    try {
        store = configureStore({
            reducer: rootReducer,
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({
                    immutableCheck: process.env.NODE_ENV === 'production',
                    serializableCheck: process.env.NODE_ENV === 'production',
                }).concat(tokenMiddleware, websocketMiddleware, notificationMiddleware, backendMiddleware),
        });

        await store.dispatch(initializeAuth());
        return store;
    } catch (err) {
        console.error("Store initialization failed:", err.message);
        throw new Error(err.message);
    }
};

// Function to get the store instance
export const getStore = async () => {
    return await store;
};

export default createAppStore;