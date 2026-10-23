import React, {memo, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getSpaceRequestsAction } from '../../service/actions/spaceActions';
import { getRequestsInSpace } from '../../service/selectors/spaceSelectors';
import {REQUESTS_FAILED, UPDATE_UNSEEN_SPACE_REQUESTS} from '../../service/constants/spaceConstants';
import Request from './Request';
import {rem} from "../../utils/uiUtils";

const SpaceRequests = ({ count, spaceId, loading, setLoading }) => {
    const dispatch = useDispatch();
    const requests = useSelector(state => getRequestsInSpace(state, spaceId));
    const { errors } = useSelector(state => state.app);
    const requestError = errors[spaceId]?.error === REQUESTS_FAILED || false;



    useEffect(() => {
        const fetchRequests = async () => {
            if (requestError) return;
            if (requests !== null && requests.length === 0 && !loading) {
                setLoading(true);
                await dispatch(getSpaceRequestsAction(spaceId));
                setLoading(false);
            }
        };
        fetchRequests();
    }, [dispatch, requests, spaceId, loading, requestError]);

    useEffect(() => {
        return () => {
            if (count > 0) {
                dispatch({
                    type: UPDATE_UNSEEN_SPACE_REQUESTS,
                    payload: spaceId,
                });
            }
        };
    }, [count, dispatch, spaceId]);


    const renderRequest = ({ item }) => <Request request={item} key={item.requestId} />;

    return (
        <View style={styles.dropdownMenu}>
            {loading ? (
                <ActivityIndicator size={"small"} color={"#fff"} />
            ) : requestError ? (
                <Text style={styles.errorMessage}>Something went wrong while retrieving the space requests.</Text>
            ) : requests && requests.length > 0 ? (
                <FlatList data={requests}
                    renderItem={renderRequest}
                    keyExtractor={(item) => item.requestId.toString()}
                />
            ) : (
                <Text style={styles.noRequestsMessage}>
                    No space requests have come in yet. Share your space with friends to see them here!
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    dropdownMenu: {
        position: "absolute",
        alignSelf: "center",
        top: rem(6),
        borderWidth: 1,
        borderColor: "#1e1e1e",
        width: "98%",
        borderRadius: 12,
        padding: 16,
        zIndex: 1001,
        backgroundColor: "#000",
    },
    errorMessage: {
        width: "98%",
        padding: rem(0.5),
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.02),
        color: "red",
        textAlign: "center",
        marginVertical: 8,
    },
    noRequestsMessage: {
        width: "98%",
        paddingHorizontal: rem(1),
        color: "#3083FFFF",
        textAlign: 'center',
        fontSize: rem(1.4),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.02)
    },
});

export default memo(SpaceRequests);