import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { REGISTER_NOTIFICATION } from '../service/constants/appConstants';
import { API } from '../service/api/utils';


// Todo: Enable settings for enable or disable push notifications
const notificationMiddleware = (store) => (next) => async (action) => {
    if (action.type === REGISTER_NOTIFICATION) {
        if (!Device.isDevice) {
            console.warn('Push notifications are only available on physical devices.');
            return next(action);
        }

        try {
            // Check if the app has already asked for permissions
            const hasAskedForPermissions = await AsyncStorage.getItem('askedForNotifications');
            const storedToken = await AsyncStorage.getItem('notificationToken');

            // Check the current permissions status
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Request permissions only if the user hasn't been asked before
            if (!hasAskedForPermissions && existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
                // Mark as asked to prevent repeated requests
                await AsyncStorage.setItem('askedForNotifications', "true");
            }

            // If permissions are not granted, skip further actions
            if (finalStatus !== 'granted') {
                console.warn('Notification permissions not granted.');
                return next(action);
            }

            // Fetch the current notification token
            const newToken = (await Notifications.getDevicePushTokenAsync({
                gcmSenderId: "826840979910"
            })).data;

            // If a token already exists and matches the current token, skip registration
            if (storedToken && storedToken === newToken) {
                console.log('Token already exists and matches, skipping registration: ', newToken);
                return next(action);
            }

            // Send the new token to the backend
            const response = await API.post(
                '/notification/save-token',
                JSON.stringify({ token: newToken }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Save the token to AsyncStorage if the backend registration is successful
            if (response.status === 200) {
                await AsyncStorage.setItem('notificationToken', newToken);
                console.log('Token registered successfully');
            } else {
                console.error('Failed to register token with the backend.');
            }
        } catch (error) {
            console.error('Error in notification middleware:', error.message);
        }
    } else {
        return next(action);
    }
};

export default notificationMiddleware;