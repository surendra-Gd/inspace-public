import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { SPACE_ERROR } from "../service/constants/spaceConstants";
import { addSpaceAction } from "../service/actions/spaceActions";
import RetryErrorComponent from "../components/loader/RetryErrorComponent";
import { getCurrentSpace } from "../service/selectors/spaceSelectors";
import {ActivityIndicator} from "react-native";


export default function InSpace({ children }) {
    const dispatch = useDispatch();
    const router = useRouter();

    const { spaceid } = useLocalSearchParams();
    const currentSpace = useSelector(getCurrentSpace);

    const [loading, setLoading] = useState(false);
    const { errors } = useSelector(state => state.app);

    const spaceError = errors[currentSpace?.spaceId || spaceid] || {};
    const isError = spaceError?.error === SPACE_ERROR || false;


    useEffect(() => {
        const loadCurrentSpace = () => {
            if (!currentSpace) {
                if (isError) return;
                setLoading(true);
                dispatch(addSpaceAction(spaceid, router)).finally(() => {
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        };
        loadCurrentSpace();
    }, [spaceid, dispatch, isError, router]);

    if (isError) {
        return (
            <RetryErrorComponent
                errorMessage="An error occurred while loading this space. Please try again"
            />
        );
    }

    if (loading)
        return (
            <ActivityIndicator color={"#3c89fb"} size={25} style={{
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
                top: "50%",
                backgroundColor: "#000"
            }}/>
        );


    return (
        <>
            {currentSpace && children}
        </>
    );

}
