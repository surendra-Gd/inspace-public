import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import {toastConfig} from "../utils/toastConfig";
import {View} from "react-native";

export default function PublicScreen({ children }) {
    const dispatch = useDispatch();
    const router = useRouter();

    const { userData } = useSelector(state => state.auth);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const authenticate = async () => {
            const token = await AsyncStorage.getItem('profile');
            const accessToken = JSON.parse(token)?.access_token;

            // Check if userData and accessToken exist
            const isAuth = userData && accessToken;
            setIsAuthenticated(isAuth);

            if (isAuth) {
                router.replace("/");
            }
        };
        authenticate();
    }, [userData, dispatch, router]);


    return !isAuthenticated ? (
        <View style={{backgroundColor: "#000", flex: 1}}>
            {children}
            <Toast config={toastConfig} />
        </View>
    ) : null;
}