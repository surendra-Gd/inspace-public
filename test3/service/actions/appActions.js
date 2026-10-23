import {
    ADD_ACTION_LOADING,
    REMOVE_ACTION_LOADING,
    SET_ERROR,
} from "../constants/appConstants";


export const addActionLoading = (key, action) => async (dispatch) => {
    await dispatch(
        {type:ADD_ACTION_LOADING, payload: {key, action}}
    )
}

export const removeActionLoading = (key, value) => async (dispatch) => {
    await dispatch(
        {type: REMOVE_ACTION_LOADING, payload: {key, value}}
    )
}



export const setError = (key, error, message) => async (dispatch) => {
    await dispatch({
        type: SET_ERROR,
        payload: {key, error, message}
    })
}