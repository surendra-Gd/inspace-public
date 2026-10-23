import {
    ADD_TEXT,
    ADD_TEXT_MESSAGE, REMOVE_TEXT,
    LIKE_TEXT_UPDATE,
    SET_TEXT_MESSAGES,
    SET_TEXTS, UNLIKE_TEXT_UPDATE,
    DELETE_TEXT_MESSAGE,
    SET_STREAKS, REMOVE_SPACE, REMOVE_MEMBER,
} from "../constants/spaceConstants";
import {DELETE_SPACE} from "../constants/userConstants";

const initialState = {
    texts: {},
    textMessages: {},
    unseenMessages: {},
    streaks: {}
}


export const textReducer = (state = initialState, action) => {

    switch (action.type) {
        case SET_TEXTS: {
            const {texts} = action.payload;
            const newTexts = texts.reduce((acc, text) => {
                acc[text.textId] = {
                    ...text,
                    page: null
                };
                return acc;
            }, {});

            return {
                ...state,
                texts: {
                    ...state.texts,
                    ...newTexts,
                }
            }
        }

        case ADD_TEXT: {
            const text = action.payload;
            return {
                ...state,
                texts: {
                    [text.textId]: text,
                    ...state.texts
                }
            }
        }

        case SET_TEXT_MESSAGES: {
            const {textMessages, textId, page} = action.payload;
            const newTextMessages = textMessages.reduce((acc, message) => {
                acc[message.id] = message;
                return acc;
            }, {});

            const updatedTexts = Object.keys(state.texts).reduce((acc, t) => {
                const text = state.texts[t];
                if (t === textId) {
                    acc[t] = {...text, page: page};
                } else {
                    acc[t] = text;
                }
                return acc;
            }, {});

            return {
                ...state,
                textMessages: {
                    ...state.textMessages,
                    ...newTextMessages,
                },
                texts: updatedTexts
            }
        }

        case ADD_TEXT_MESSAGE: {
            const textMessage = action.payload;

            const updatedTexts = Object.keys(state.texts).reduce((acc, t) => {
                const text = state.texts[t];
                if (Number(t) === textMessage?.textId) {
                    acc[t] = {
                        ...text,
                        lastUpdatedOn: textMessage.timeStamp,
                        messagesCount: text.messagesCount+1
                    };
                } else {
                    acc[t] = text;
                }
                return acc;
            }, {});

            return {
                ...state,
                textMessages: {
                    [textMessage.id]: textMessage,
                    ...state.textMessages
                },
                texts: updatedTexts
            }
        }

        case DELETE_TEXT_MESSAGE: {
            const {textId, messageId} = action.payload;

            const { [messageId]: removedTextMessage, ...remainingTextMessages } = state.textMessages;
            const updatedTexts = Object.keys(state.texts).reduce((acc, t) => {
                const text = state.texts[t];
                if (Number(t) === textId) {
                    acc[t] = {
                        ...text,
                        messagesCount: text.messagesCount-1
                    };
                } else {
                    acc[t] = text;
                }
                return acc;
            }, {});

            return {
                ...state,
                texts: updatedTexts,
                textMessages: remainingTextMessages
            }
        }


        case LIKE_TEXT_UPDATE: {
            const {textId, memberId, currentMemberId} = action.payload;

            const updatedTexts = Object.keys(state.texts).reduce((acc, t) => {
                const text = state.texts[t];
                if (Number(t) === textId) {
                    acc[t] = {
                        ...text,
                        likesCount: text.likesCount+1,
                        liked: currentMemberId === memberId ? true : text.liked
                    };
                } else {
                    acc[t] = text;
                }
                return acc;
            }, {});

            return {
                ...state,
                texts: updatedTexts
            }
        }

        case UNLIKE_TEXT_UPDATE: {
            const {textId, memberId, currentMemberId} = action.payload;

            const updatedTexts = Object.keys(state.texts).reduce((acc, t) => {
                const text = state.texts[t];
                if (Number(t) === textId) {
                    acc[t] = {
                        ...text,
                        likesCount: Math.max(0, text.likesCount - 1), // Prevent negative likes
                        liked: currentMemberId === memberId ? false : text.liked
                    };
                } else {
                    acc[t] = text;
                }
                return acc;
            }, {});

            return {
                ...state,
                texts: updatedTexts
            }
        }

        case REMOVE_TEXT: {
            const {textId} = action.payload;

            const { [textId]: removedText, ...remainingTexts } = state.texts;

            const updatedTextMessages = Object.keys(state.textMessages).reduce((acc, messageId) => {
                const textMessage = state.textMessages[messageId];
                if (textMessage.textId !== textId) {
                    acc[messageId] = textMessage;
                }
                return acc;
            }, {});

            return {
                ...state,
                texts: remainingTexts,
                textMessages: updatedTextMessages
            };
        }

        case SET_STREAKS: {
            const {streaks} = action.payload;
            const newStreaks = streaks.reduce((acc, streak) => {
                acc[streak.id] = {...streak};
                return acc;
            }, {});

            return {
                ...state,
                streaks: {
                    ...state.streaks,
                    ...newStreaks
                }
            }
        }

        case DELETE_SPACE:
        case REMOVE_SPACE: {
            const spaceId = action.payload;

            if (!spaceId) return state;

            const filterEntitiesBySpaceId = (entities, spaceId) => {
                return Object.keys(entities).reduce((acc, entityId) => {
                    const entity = entities[entityId];
                    if (entity.spaceId !== spaceId) {
                        acc[entityId] = entity;
                    }
                    return acc;
                }, {});
            };

            const updatedTexts = filterEntitiesBySpaceId(state.texts, spaceId);
            const updatedTextMessages = filterEntitiesBySpaceId(state.textMessages, spaceId);
            const updatedStreaks = filterEntitiesBySpaceId(state.streaks, spaceId);

            // Return the updated state
            return {
                ...state,
                texts: updatedTexts,
                textMessages: updatedTextMessages,
                streaks: updatedStreaks,
            };
        }

        case REMOVE_MEMBER: {
            const {memberId} = action.payload;

            if(!memberId) return state;

            const filterEntitiesByMemberId = (entities, memberId) => {
                return Object.keys(entities).reduce((acc, entityId) => {
                    const entity = entities[entityId];
                    if (entity.memberId !== memberId) {
                        acc[entityId] = entity;
                    }
                    return acc;
                }, {});
            };

            const updatedTexts = filterEntitiesByMemberId(state.texts, memberId);
            const updatedTextMessages = filterEntitiesByMemberId(state.textMessages, memberId);
            const updatedStreaks = filterEntitiesByMemberId(state.streaks, memberId);

            return {
                ...state,
                texts: updatedTexts,
                textMessages: updatedTextMessages,
                streaks: updatedStreaks,
            }
        }

        default:
            return state;
    }
}


/**
 *  getTextsBySpaceId
 *
 *  createText -> websocket
 *
 *  deleteText -> websocket
 *
 *  likeToText -> websocket
 *
 *  unLikeToText -> websocket
 *
 *  addTextMessages -> websocket
 *
 *  removeTextMessages -> websocket
 *
 *  unseenTexts -> https
 *
 *  unseenTextMessages -> https
 *
 *  getTextMessagesByTextId
 *
 *
 * **/

/*
*   Text Unseen -> textId, spaceId, type(text, text_message) using websockets to update
*
*   Text Message Unseen -> textId, count, type(text, text_message) using websockets to update
* */

/*
*   when new text message is arrived is add on text list and also text message itself
*   then also add unseen text message (updated it effect by useEffect nature)
*
*   when new text is arrived add on text and also unseen text
*   (updated it effect by useEffect nature)
*
*   unseen text and text message gets by when websocket is connected.
*
*   unseen text is updated when it shows is view
*   unseen text message is updated when it is in chat
*
*     
*   use text page details in space
*   when add new page update in the space of text
*   use text payload with spaceId in text slice
* */

/*
*   Focus on In App updates now
*
* */