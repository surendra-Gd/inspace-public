import React, { memo, useEffect, useState } from "react";
import {View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Image} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
    addSpaceRequestAction,
    getSpaceRequestStatusAction,
    removeSpaceRequestAction
} from "../../service/actions/userActions";
import { NO_REQUEST, OUTGOING_REQUEST, SPACE_REQUEST_ACTION } from "../../service/constants/appConstants";
import { addActionLoading, removeActionLoading } from "../../service/actions/appActions";
import { SPACE_REQUEST_STATUS_ERROR } from "../../service/constants/userConstants";
import {rem} from "../../utils/uiUtils";

const JoinSpaceModal = ({ space, className1, className2, joinButtonText, requestButtonText, errorType }) => {
    const dispatch = useDispatch();
    const { uniqueId, spaceId, request } = space;
    const [loading, setLoading] = useState(false);

    const { errors, actionLoading } = useSelector(state => state.app);

    const action = actionLoading[spaceId] || "";
    const statusError = errors[spaceId]?.error === SPACE_REQUEST_STATUS_ERROR || false;

    useEffect(() => {
        const fetchRequestStatus = async () => {
            if (statusError) return;
            setLoading(true);
            await dispatch(getSpaceRequestStatusAction(spaceId));
            setLoading(false);
        };
        fetchRequestStatus();
    }, [dispatch, spaceId]);

    const addRequest = async () => {
        dispatch(addActionLoading(spaceId, SPACE_REQUEST_ACTION));
        dispatch(addSpaceRequestAction(spaceId, uniqueId))
            .finally(() => {
                dispatch(removeActionLoading(spaceId, SPACE_REQUEST_ACTION));
            });
    };

    const removeRequest = async () => {
        dispatch(addActionLoading(spaceId, SPACE_REQUEST_ACTION));
        dispatch(removeSpaceRequestAction(spaceId, request?.requestId, uniqueId))
            .finally(() => {
                dispatch(removeActionLoading(spaceId, SPACE_REQUEST_ACTION));
            });
    };

    if (loading) return <ActivityIndicator size="small" color="#000" />;

    return (
        <View>
            {action === SPACE_REQUEST_ACTION ? (
                <ActivityIndicator size="small" color="#6f6f6f" />
            ) : statusError ? (
                errorType ? (
                    <View style={styles.errorContainer}>
                        <Image source={require("../../assets/images/warning.png")} style={{width: 20, height: 20}} />
                        <Text style={styles.errorTxt}>Error</Text>
                    </View>
                    ) : <Text style={styles.errorText}>Something went wrong while getting space request status.</Text>
            ) : (
                request && (
                    request.status === OUTGOING_REQUEST ? (
                        <TouchableOpacity onPress={removeRequest} style={className1}>
                            <Text style={requestButtonText}>Requested</Text>
                        </TouchableOpacity>
                    ) : request.status === NO_REQUEST && (
                        <TouchableOpacity onPress={addRequest} style={className2}>
                            <Text style={joinButtonText}>Join</Text>
                        </TouchableOpacity>
                    )
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    buttonText: {
        color: '#000',
        fontSize: rem(1.3),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.04)
    },
    errorText: {
        color: '#d9534f',
        fontSize: 13,
        fontFamily: "Inter_500Medium",
        marginVertical: 10,
    },
    errorContainer: {
        justifyContent: "center",
        alignItems: "center"
    },
    errorTxt: {
        fontFamily: "Inter_800ExtraBold",
        fontSize: rem(1.2),
        color: "red"
    }
});

export default memo(JoinSpaceModal);