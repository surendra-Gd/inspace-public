import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeFriendRequestAction } from '../../service/actions/userActions';
import { addActionLoading, removeActionLoading } from '../../service/actions/appActions';
import { REMOVE_FRIEND_REQUEST_ACTION } from '../../service/constants/appConstants';


const RemoveRequest = ({ request, text, className1, className2, className3 }) => {
    const { requestId, user } = request;
    const dispatch = useDispatch();
    const actionLoading = useSelector(state => state.app.actionLoading);
    const loading = actionLoading[user?.userId] || "";

    const handleRequest = async () => {
        const { userId, username } = user;
        await dispatch(addActionLoading(userId, REMOVE_FRIEND_REQUEST_ACTION));
        dispatch(removeFriendRequestAction(userId, requestId, username)).finally(() => {
            dispatch(removeActionLoading(userId, REMOVE_FRIEND_REQUEST_ACTION));
        });
    };

    return (
        <View style={className1}>
            {loading === REMOVE_FRIEND_REQUEST_ACTION ? (
                <ActivityIndicator size="small" color="#fff" />
            ) : (
                <TouchableOpacity onPress={handleRequest}
                    style={className2}
                    disabled={Boolean(loading)}
                >
                    <Text style={className3}>
                        {text}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
export default RemoveRequest;