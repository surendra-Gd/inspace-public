import React, { useState, useEffect, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';
import debounce from 'lodash/debounce';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API} from "../../service/api/utils";
import {Stack, useRouter} from "expo-router";
import UserBanner from "../../components/shared/UserBanner";
import {rem} from "../../utils/uiUtils";
import Toast from "react-native-toast-message";


const Search = () => {
    const { userData } = useSelector((state) => state.user);
    const userId = userData?.userId;
    const router = useRouter();

    const [inputValue, setInputValue] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [accessToken, setAccessToken] = useState(null);

    const setInitialValue = () => {
        setUsers([]);
        setLoading(false);
    };

    const clearValues = () => {
        setInitialValue();
        setInputValue("");
    };

    useEffect(() => {
        const loadAccessToken = async () => {
            const storedProfile = await AsyncStorage.getItem('profile');
            const parsedProfile = storedProfile ? JSON.parse(storedProfile) : null;
            setAccessToken(parsedProfile?.access_token || null);
        };
        loadAccessToken();
        return () => clearValues()
    }, []);

    const debouncedHandleSearch = useMemo(
        () =>
            debounce(async (q) => {
                setLoading(true);
                const encodedQuery = encodeURIComponent(q);
                setUsers([]);

                try {
                    const res = await API.get(`/users/search?query=${encodedQuery}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`, // Add authorization header if needed
                        },
                    });
                    setUsers(res.data);
                } catch (error) {
                    const errMsg = error?.data?.message || 'Unexpected error occurred';
                    Toast.show({type: "error", text1: `Error fetching users: ${errMsg}`});
                } finally {
                    setLoading(false);
                }
            }, 1000),
        [accessToken]
    );


    const handleInputChange = (value) => {
        setInputValue(value);
        if (value === '') {
            setInitialValue();
            return;
        }
        debouncedHandleSearch(value);
    };


    const searchHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <Image source={require("../../assets/images/back (1).png")} style={{width: 20, height: 20, zIndex: 1000}} />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
                <TextInput style={styles.input}
                    value={inputValue}
                    onChangeText={handleInputChange}
                    placeholder="Find your friends"
                    placeholderTextColor={"#6F6F6FFF"}
                />
                <Image source={require("../../assets/images/loupe.png")} style={[styles.searchIcon, inputValue && { opacity: 0 }]} />
                {inputValue !== '' && (
                    <View style={styles.clearButtonWrapper}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <TouchableOpacity onPress={clearValues}>
                                <Image source={require("../../assets/images/cancel (1).png")} style={{width: 19, height: 19}} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>
    )

    return (
        <View style={styles.section}>
            <Stack.Screen options={{
                header: () => searchHeader(),
            }} />
            <View style={styles.usersContainer}>
                {users.length > 0 && (
                    <FlatList data={users}
                        keyExtractor={(item) => item.userId.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.userItem}>
                                <UserBanner user={item} currentId={userId} />
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 15,
    },
    header: {
        position: "absolute",
        top: rem(5),
        width: "100%",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        gap: 15
    },
    inputContainer: {
        position: "relative",
        flexDirection: 'row',
        alignSelf: "center",
        width: rem(30),
        height: rem(4),
    },
    input: {
        width: "100%",
        height: "auto",
        borderRadius: 15,
        color: "#d9d9d9",
        backgroundColor: 'rgba(16, 16, 16, 1)',
        fontSize: rem(1.5),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.05),
        paddingLeft: rem(2)
    },
    searchIcon: {
        position: "absolute",
        top: "25%",
        right: "7%",
        width: 18,
        height: 18,
    },
    clearButtonWrapper: {
        position: "absolute",
        top: "25%",
        right: "5%",
    },
    usersContainer: {
        top: rem(10),
    },
    userItem: {
        alignItems: "center",
        alignSelf: "center",
        marginTop: rem(1),
        marginBottom: rem(2),
    },
});

export default Search;