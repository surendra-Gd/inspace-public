import React from "react";
import {View, Text, StyleSheet} from "react-native";
import {Image} from "expo-image";
import Animated, {FadeIn, FadeOut} from "react-native-reanimated";

const StreakToast = ({props}) => {
    const {profileUri, streakCount} = props || {};

    const getStreakMessage = (count) => {
        if (count >= 1 && count <= 3) {
            return `🔥 You're warming up with ${count} streaks! Let's keep it going! 💪`;
        } else if (count >= 4 && count <= 7) {
            return `🔥 You're on fire with ${count} streaks today! Keep it up! ✨`;
        } else if (count >= 8 && count <= 11) {
            return `🔥 You're unstoppable with ${count} streaks! Crushing it! 🚀`;
        } else if (count >= 12 && count <= 15) {
            return `🔥 ${count} streaks?! You're a legend! Keep slaying! 🌟`;
        } else {
            return `🔥 You're doing great with ${count} streaks! Keep going! 💪`;
        }
    };

    return (
        <Animated.View
            style={styles.streakToastContainer}
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(500)}
        >
            {profileUri && (
                <Image source={{uri: profileUri}}
                style={styles.toastIcon} />
            )}
            <Text style={styles.streakToastText}>
                {getStreakMessage(streakCount)}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    streakToastContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1F1F1F", // Dark gray background
        padding: 15,
        borderRadius: 25,
        marginHorizontal: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ffdd00", // Electric blue border
        shadowColor: "#ffdd00", // Glow effect
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    toastIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 2,
        borderColor: "#ffdd00", // Electric blue border for the profile icon
    },
    streakToastText: {
        flex: 1,
        fontSize: 14,
        color: "#FFFFFF", // White text for contrast
        fontFamily: "Inter_600SemiBold", // Modern font
        lineHeight: 18,
    },
});

export default StreakToast;