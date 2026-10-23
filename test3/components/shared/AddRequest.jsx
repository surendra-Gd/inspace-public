import React from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addFriendRequestAction } from '../../service/actions/userActions';
import { addActionLoading, removeActionLoading } from '../../service/actions/appActions';
import { ADD_FRIEND_REQUEST_ACTION } from '../../service/constants/appConstants';


const AddRequest = ({ user, text, className1, className2, className3 }) => {
    const dispatch = useDispatch();
    const actionLoading = useSelector(state => state.app.actionLoading);
    const loading = actionLoading[user?.userId] || "";

    const handleRequest = async () => {
        const userId = user?.userId;
        await dispatch(addActionLoading(userId, ADD_FRIEND_REQUEST_ACTION));
        dispatch(addFriendRequestAction(user)).finally(() => {
            dispatch(removeActionLoading(userId, ADD_FRIEND_REQUEST_ACTION));
        });
    };

    return (
        <View style={className1}>
            {loading === ADD_FRIEND_REQUEST_ACTION ? (
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

export default AddRequest;