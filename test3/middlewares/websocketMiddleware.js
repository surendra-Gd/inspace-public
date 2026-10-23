import { Client } from "@stomp/stompjs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    ADD_CHANNEL,
    CONNECT_STOMP,
    DISCONNECT_STOMP, REMOVE_STOMP_CLIENT,
    REMOVE_CHANNEL, SEND_MESSAGE,
    SET_STOMP_CLIENT,
    SUBSCRIBE_CHANNEL, UNSUBSCRIBE_CHANNEL
} from "../service/constants/stompConstants";
import {receiveMessage} from "../service/actions/stompActions";
import Toast from "react-native-toast-message";
import {LOGOUT} from "../service/constants/authConstants";


// The WebSocket URL
const BASE_URL = process.env.REACT_APP_WS_URL || "wss://api.theinspace.net/ws/websocket";

// Middleware to validate the STOMP client
const validateStompClient = (stompClient) => {
    if (!stompClient?.connected) {
        console.log("STOMP client is not connected.");
        return false;
    }
    return true;
};

// Middleware function for handling WebSocket actions
const webSocketMiddleware = (store) => (next) => async (action) => {
    const { stompClient, subscribedChannels } = store.getState().stomp;
    const { userData } = store.getState().auth;

    switch (action.type) {
        case CONNECT_STOMP: {
            try {
                const profile = await AsyncStorage.getItem("profile");
                const accessToken = JSON.parse(profile)?.access_token;

                // If the client is already connected, skip the process
                if (stompClient?.connected) {
                    console.log("STOMP client is already connected.");
                    return;
                }

                // Create and configure the STOMP client
                const client = new Client({
                    brokerURL: `${BASE_URL}?token=${accessToken}`,
                    reconnectDelay: 5000,
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,
                    debug: (err) => {
                        console.log(err);
                    },
                    onConnect: () => {
                        // Once connected, subscribe to the user's channel
                        store.dispatch({
                            type: SUBSCRIBE_CHANNEL,
                            payload: `/sub/user/${userData.userId}`,
                        });
                    },
                    onStompError: (frame) => {
                        console.error("STOMP error:", frame.headers["message"]);
                        console.error("Details:", frame.body);
                    },
                    forceBinaryWSFrames: true,
                    appendMissingNULLonIncoming: true,
                });

                // Activate the STOMP client
                client.activate();

                // Store the STOMP client instance in the store
                store.dispatch({ type: SET_STOMP_CLIENT, payload: client });
            } catch (err) {
                setTimeout(() => {
                    Toast.show({
                        type: "error",
                        text1: "Uh-oh! Connection lost. 😕 Reopen the app to fix it!",
                        position: "bottom"
                    });
                }, 3000);
            }
            break;
        }

        case LOGOUT:
        case DISCONNECT_STOMP: {
            try {
                if (validateStompClient(stompClient)) {
                    subscribedChannels.forEach((channel) => {
                        store.dispatch({ type: UNSUBSCRIBE_CHANNEL, payload: channel });
                    });
                    stompClient.deactivate();
                    store.dispatch({ type: REMOVE_STOMP_CLIENT });
                }
            } catch (err) {
                console.error("Error disconnecting STOMP:", err.message);
            }
            break;
        }

        // Action handler for SUBSCRIBE_CHANNEL
        case SUBSCRIBE_CHANNEL: {
            if (!validateStompClient(stompClient)) {
                console.error("STOMP client is invalid or not connected.");
                return;
            }

            const channel = action.payload;
            console.log("Attempting to subscribe to channel:", channel);

            // Check if already subscribed
            // if (subscribedChannels.includes(channel)) {
            //     console.log(`Already subscribed to ${channel}`);
            //     return;
            // }

            // Subscribe to the channel
            try {
                console.log("Subscribing to channel...");
                stompClient.subscribe(channel, (message) => {
                    console.log("Received message on channel:", channel);
                    const payload = JSON.parse(message.body);
                    store.dispatch(receiveMessage(payload, channel));
                });

                // Add the channel to the subscribed channels
                store.dispatch({ type: ADD_CHANNEL, payload: channel });
                console.log(`Successfully subscribed to ${channel}`);
            } catch (error) {
                console.error(`Error subscribing to channel ${channel}:`, error);
            }
            break;
        }

        case UNSUBSCRIBE_CHANNEL: {
            if (!validateStompClient(stompClient)) return;
            const channel = action.payload;

            if (!subscribedChannels.includes(channel)) return;

            stompClient.unsubscribe(channel);
            await store.dispatch({ type: REMOVE_CHANNEL, payload: channel });
            break;
        }

        case SEND_MESSAGE: {
            const { channel, message } = action.payload;
            if (!validateStompClient(stompClient)) {
                Toast.show({
                    type: "error",
                    text1: "Uh-oh! Connection lost. 😕 Reopen the app to fix it!",
                    position: "bottom"
                });
                return;
            }

            stompClient.publish({
                destination: `/app/${channel}`,
                body: JSON.stringify(message),
            });
            break;
        }

        default:
            break;
    }

    return next(action);
};

export default webSocketMiddleware;