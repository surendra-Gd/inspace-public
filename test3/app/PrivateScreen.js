import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import {setInitialAuthState} from "../service/actions/authActions";
import {toastConfig} from "../utils/toastConfig";
import Toast from "react-native-toast-message";
import {View} from "react-native";


export default function PrivateScreen({ children }) {
    const dispatch = useDispatch();
    const router = useRouter();

    const { userData } = useSelector(state => state.auth);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const authenticate = async () => {
            const token = await AsyncStorage.getItem("profile")
            const accessToken = JSON.parse(token)?.access_token;

            const isAuth = userData && accessToken;
            setIsAuthenticated(isAuth);
            
            if (!isAuth) {
                await AsyncStorage.removeItem('profile');
                await AsyncStorage.removeItem('x-ps');
                await dispatch(setInitialAuthState());
                router.replace("/(auth)/login");
            }
        };
        authenticate();
    }, [userData, dispatch, router]);
    
    return isAuthenticated ? (
        <View style={{backgroundColor: "#000", flex: 1}}>
            {children}
            <Toast config={toastConfig} />
        </View>
    ) : null;
}