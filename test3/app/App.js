import {useDispatch, useSelector} from 'react-redux';
import { APP_ERROR } from "../service/constants/userConstants";
import {CURRENT_PAGE, NETWORK_ERROR} from "../service/constants/appConstants";
import RetryErrorComponent from "../components/loader/RetryErrorComponent";
import React, {useEffect} from "react";
import {usePathname, useSegments} from "expo-router";
import * as Notifications from "expo-notifications";
import {toastConfig} from "../utils/toastConfig";
import Toast from "react-native-toast-message";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});



export default function App({children}) {
    const {errors} = useSelector(state => state.app);
    const dispatch = useDispatch();
    const pathname = usePathname();

    useEffect(() => {
        dispatch({type: CURRENT_PAGE, payload: pathname});
    }, [pathname]);

    const appError = errors["app"]?.error === APP_ERROR || false;
    const networkError = errors["network"]?.error === NETWORK_ERROR || false;

    if (networkError) {
        return (
            <RetryErrorComponent errorMessage={
                "Something went wrong. The internet connection might be unavailable, " +
                "or the server is unreachable. Please try again later"
            }/>
        )
    }

    if (appError) {
        return (
            <RetryErrorComponent errorMessage={
                "There is something happened. Please try again."
            }/>
        )
    }

    return (
        <>
            {children}
            <Toast config={toastConfig} />
        </>
    );
}