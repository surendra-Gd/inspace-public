import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import {rem} from "../../utils/uiUtils";

export default function MainHeader() {
    const { userData } = useSelector(state => state.user);
    const router = useRouter();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.push('/search')}>
                <Image source={require("../../assets/images/search (1).png")} style={{width: 19.5, height: 19.5}} resizeMode="contain" />
            </TouchableOpacity>
            <Text style={styles.title}>InSpace</Text>
            <TouchableOpacity
                onPress={() => router.push("/account")}
                style={styles.userContainer}
            >
                {userData?.profile && (
                    <Image
                        source={{ uri: userData.profile }}
                        style={styles.userImage}
                    />
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: 90,
        paddingTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        backgroundColor: "#000",
        paddingHorizontal: rem(3)
    },
    title: {
        fontFamily: "Inter_700Bold",
        fontSize: rem(2.5),
        letterSpacing: rem(0.04),
        color: '#fff',
    },
    userContainer: {
        width: 28,
        height: 28,
        borderRadius: 100,
        overflow: 'hidden',
    },
    userImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
});