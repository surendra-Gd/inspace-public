import { Provider } from 'react-redux';
import React, { useState, useEffect } from 'react';
import {ActivityIndicator, View, Platform, NativeModules} from 'react-native';
import RetryErrorComponent from "../components/loader/RetryErrorComponent";
import createAppStore from "../service/store";
import { useFonts } from "expo-font";
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black
} from "@expo-google-fonts/inter";
import AppLoading from "../components/loader/AppLoading";
import { Stack } from "expo-router";
import App from "./App";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { TextDecoder, TextEncoder } from "text-encoding";
import { DISCONNECT_STOMP } from "../service/constants/stompConstants";
import {GestureHandlerRootView} from "react-native-gesture-handler";


const _layout = () => {
    const [store, setStore] = useState(null);
    const [error, setError] = useState(null);
    const [appLoading, setAppLoading] = useState(true);
    const [loading, setLoading] = useState(true);


    let [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_800ExtraBold,
        Inter_900Black
    });

    if (typeof global.TextDecoder === "undefined") {
        global.TextDecoder = TextDecoder;
    }
    if (typeof global.TextEncoder === "undefined") {
        global.TextEncoder = TextEncoder;
    }

    // Initialize the app and store
    useEffect(() => {
        const initializeApp = async () => {
            try {
                const appStore = await createAppStore();
                setStore(appStore);
            } catch (err) {
                setError(`Error initializing the app. Please try again later.`);
            } finally {
                setLoading(false);
            }
        };
        initializeApp();
    }, []);


    useEffect(() => {
        if (!store) return;
        const handleTermination = () => {
            store.dispatch({ type: DISCONNECT_STOMP });
        };
        if (Platform.OS === "android" && NativeModules.AppTerminationHandler) {
            NativeModules.AppTerminationHandler.setOnTerminate(handleTermination);
        }
        return () => {
            handleTermination();
        };
    }, [store]);


    // Simulate app loading state
    useEffect(() => {
        const timeout = setTimeout(() => {
            setAppLoading(false);
        }, 3000);
        return () => clearTimeout(timeout);
    }, []);

    // Handle loading states and errors
    if (appLoading) {
        return <AppLoading />;
    } else if (loading || !fontsLoaded) {
        return (
            <View style={{ flex: 1, backgroundColor: "#000" }}>
                <ActivityIndicator
                    color={"#3c89fb"}
                    size={25}
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center",
                        top: "50%",
                        backgroundColor: "#000"
                    }}
                />
            </View>
        );
    }

    if (error) return <RetryErrorComponent errorMessage={error} />;


    return (
        <GestureHandlerRootView>
            <ThemeProvider value={DarkTheme}>
                <Provider store={store}>
                    <App>
                        <Stack
                            screenOptions={{
                                contentStyle: {
                                    backgroundColor: "#000"
                                },
                                cardStyleInterpolator: ({ current }) => ({
                                    cardStyle: {
                                        opacity: current.progress,
                                    },
                                }),
                            }}
                        >
                            <Stack.Screen name="(main)" options={{ headerShown: false }} />
                            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
                        </Stack>
                    </App>
                </Provider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
};

export default _layout;