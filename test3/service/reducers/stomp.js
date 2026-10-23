import {ADD_CHANNEL, REMOVE_STOMP_CLIENT, REMOVE_CHANNEL, SET_STOMP_CLIENT} from "../constants/stompConstants";

const initialState = {
    stompClient: null,
    subscribedChannels: [],
    isConnected: false,
    receivedMessages: {},
    badges: {},
    stompError: {}
};

export default function stompReducer(state=initialState, action) {
    switch (action.type) {
        case SET_STOMP_CLIENT: {
            const client = action.payload;
            return {
                ...state,
                stompClient: client,
                isConnected: true
            }
        }
        case ADD_CHANNEL: {
            const channel = action.payload;
            return {
                ...state,
                subscribedChannels: [channel, ...state.subscribedChannels]
            }
        }
        case REMOVE_CHANNEL: {
            const channel = action.payload;

            const filteredChannels = state.subscribedChannels.length ?
                state.subscribedChannels.filter(c => c !== channel) : [];

            return {
                ...state,
                subscribedChannels: filteredChannels
            }
        }
        case REMOVE_STOMP_CLIENT: {
            return {
                ...state,
                subscribedChannels: [],
                isConnected: false,
                stompClient: null
            }
        }
        default:
            return state;
    }
}