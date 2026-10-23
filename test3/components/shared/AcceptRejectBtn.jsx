import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { handleFriendRequestAction } from '../../service/actions/userActions';
import { addActionLoading, removeActionLoading } from '../../service/actions/appActions';
import { HANDLE_FRIEND_REQUEST_ACTION } from '../../service/constants/appConstants';

const AcceptRejectBtn = ({ request, text1, text2, className1, className2, className3, textStyle, loaderStyle, textStyle2 }) => {
    const { requestId, user } = request;
    const dispatch = useDispatch();

    const actionLoading = useSelector(state => state.app.actionLoading);
    const loading = actionLoading[user?.userId] || false;


    const handleRequest = async (action) => {
        if (action !== 'accept' && action !== 'decline') return;

        const userId = user?.userId;
        await dispatch(addActionLoading(userId, HANDLE_FRIEND_REQUEST_ACTION));
        try {
            await dispatch(handleFriendRequestAction(user, requestId, action));
        } catch (error) {
            console.error("Friend request action failed:", error);
        } finally {
            dispatch(removeActionLoading(userId, HANDLE_FRIEND_REQUEST_ACTION));
        }
    };


    return (
        <View style={className1}>
            {loading === HANDLE_FRIEND_REQUEST_ACTION ? (
                <ActivityIndicator size="small" color="#fff" style={loaderStyle}/>
            ) : (
                <>
                    <TouchableOpacity style={className2} disabled={loading}
                        onPress={() => handleRequest('accept')}
                    >
                        <Text style={textStyle}>{text1}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={className3} disabled={loading}
                        onPress={() => handleRequest('decline')}
                    >
                        {text2 ? (
                            <Text style={textStyle2}>{text2}</Text>
                        ) : (
                            <Image source={require("../../assets/images/cross (1).png")} style={{width: 22, height: 22}} />
                        )}
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

export default AcceptRejectBtn;