import React, { useRef, useEffect } from "react";
import {
    Animated,
    Image,
    StyleSheet,
    Easing,
} from "react-native";
import Toast from "react-native-toast-message";

const UserStatusToast = ({ text1, profile, isOnline, id }) => {
    const toastWidth = useRef(new Animated.Value(50)).current;
    const toastOpacity = useRef(new Animated.Value(0)).current;

    const animateOpen = () => {
        // Open animation
        Animated.sequence([
            Animated.parallel([
                Animated.timing(toastWidth, {
                    toValue: 300, // Expand the width
                    duration: 500,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(toastOpacity, {
                    toValue: 1, // Fade in
                    duration: 500,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: false,
                }),
            ]),
        ]).start(() => {
            setTimeout(() => {
                animateClose();
            }, 2000);
        });
    };

    const animateClose = () => {
        // Close animation
        Animated.sequence([
            Animated.parallel([
                Animated.timing(toastWidth, {
                    toValue: 50, // Expand the width
                    duration: 500,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(toastOpacity, {
                    toValue: 0, // Fade in
                    duration: 100,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: false,
                }),
            ]),
        ]).start(() => {
            setTimeout(() => {
                Toast.hide();
            }, 500);
        });
    };

    useEffect(() => {
        setTimeout(() => {
            animateOpen();
        }, 1000);
    }, [id]);

    return (
        <Animated.View
            style={[
                styles.statusToastContainer,
                {
                    backgroundColor: isOnline ? "#dfdfdf" : "#f65555",
                    width: toastWidth,
                },
            ]}
        >
            {profile ? (
                <Image source={{ uri: profile }} style={styles.statusUserProfile} />
            ) : null}
            <Animated.Text style={
                [
                    styles.statusToastText,
                    {
                        opacity: toastOpacity
                    }
                 ]
            }>
                {isOnline ? `${text1} is online now!\nLet’s vibe! 🎧🔥` : `${text1} went offline.\nSee ya later! 🌙✌️`}
            </Animated.Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    statusToastContainer: {
        // width: "80%",
        paddingVertical: 5,
        justifyContent: "center",
        height: 50,
        borderRadius: 30,
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    statusToastText: {
        color: "#000",
        fontSize: 13,
        fontFamily: "Inter_600SemiBold",
        flex: 1,
        left: 5,
        right: 10
    },
    statusUserProfile: {
        left: 5,
        width: 43,
        height: 43,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: "#1e1e1e",
    },
});

export default UserStatusToast;