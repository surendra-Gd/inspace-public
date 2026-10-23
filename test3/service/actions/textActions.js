import Toast from "react-native-toast-message";
import {setError} from "./appActions";
import {
    ADD_TEXT,
    GET_STREAK_ERROR, GET_TEXT_ERROR,
    GET_TEXT_MESSAGE_ERROR,
    GET_TEXTS_ERROR,
    SET_STREAKS,
    SET_TEXT_MESSAGES,
    SET_TEXTS
} from "../constants/spaceConstants";
import {getSpaceTexts, getStreaks, getTextById, getTextMessages} from "../api/textAPI";




export const getTextsAction = (fetchPage) => async (dispatch, getState) => {
    const { currentSpaceId, spaces } = getState().space;
    const page = spaces[currentSpaceId]?.texts?.page;

    if (page && fetchPage === page.totalPages) return;
    try {
        const {error, data} = await getSpaceTexts(fetchPage);
        if (error) {
            dispatch(setError(currentSpaceId, GET_TEXTS_ERROR, error));
            return;
        }
        let { content, currentPage, totalElements, totalPages, first, last, hasNext, hasPrevious } = data;

        await dispatch({
            type: SET_TEXTS,
            payload: {
                page: {
                    currentPage,
                    totalElements,
                    totalPages,
                    first,
                    last,
                    hasNext,
                    hasPrevious
                },
                texts: content
            }
        });

    } catch (err) {
        Toast.show({type: "error", text1:"Something went wrong. Please try again later."});
    }
}


export const getTextMessagesAction = (fetchPage, textId) => async (dispatch, getState) => {const text = getState().text.texts[textId];
    const page = text?.page;

    if (page && fetchPage === page.totalPages) return;
    try {
        const {error, data} = await getTextMessages(fetchPage, textId);
        if (error) {
            dispatch(setError(textId, GET_TEXT_MESSAGE_ERROR, error));
            return;
        }
        let { content, currentPage, totalElements, totalPages, first, last, hasNext, hasPrevious } = data;

        dispatch({
            type: SET_TEXT_MESSAGES,
            payload: {
                page: {
                    currentPage,
                    totalElements,
                    totalPages,
                    first,
                    last,
                    hasNext,
                    hasPrevious
                },
                textId: textId,
                textMessages: content
            }
        });
    } catch (err) {
        Toast.show({type: "error", text1:"Something went wrong. Please try again later."});
    }
}

export const getStreaksAction = (fetchPage, memberId) => async (dispatch, getState) => {
    const member = getState().space.members[memberId];
    const page = member?.streaksPage;

    if (page && fetchPage === page.totalPages) return;
    try {
        const {error, data} = await getStreaks(fetchPage, memberId);
        if(error) {
            dispatch(setError(memberId, GET_STREAK_ERROR, "Something went wrong while getting the streaks."));
            return;
        }

        let { content, currentPage, totalElements, totalPages, first, last, hasNext, hasPrevious } = data?.response;

        await dispatch({
            type: SET_STREAKS,
            payload: {
                page: {
                    currentPage,
                    totalElements,
                    totalPages,
                    first,
                    last,
                    hasNext,
                    hasPrevious,
                    pageLastId: data?.pageLastId,
                    pageLastDate: hasNext ? data?.pageLastDate : ""
                },
                memberId: memberId,
                streaks: content
            }
        });

    } catch (err) {
        Toast.show({type: "error", text1: "Something went wrong. Please try again later."})
    }

}

export const getTextAction = (textId) => async (dispatch) => {
    try {
        const {error, data} = await getTextById(textId);
        if (error) {
            dispatch(setError(textId, GET_TEXT_ERROR));
            return;
        }
        dispatch({
            type: ADD_TEXT,
            payload: data,
            meta: {
                requiresAuth: true
            }
        });
    } catch (error) {
        dispatch(setError(textId, GET_TEXT_ERROR));
    }
};