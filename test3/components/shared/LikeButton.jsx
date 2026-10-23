import React, { useCallback, useRef, useState } from "react";
import {
    Animated,
    TouchableOpacity,
    View,
    StyleSheet,
} from "react-native";

const LikeButton = ({ textId, currentMemberId, liked, dispatch, likesCount }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current; // For scaling the heart
    const opacityAnim = useRef(new Animated.Value(1)).current; // For fading the text

    const handleTextReaction = useCallback(() => {
        const message = { textId, memberId: currentMemberId };
        const channel = liked ? "/text.unLike" : "/text.like";

        // Trigger the heart scale and opacity animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.5, // Scale up
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1, // Scale back to normal
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.timing(opacityAnim, {
            toValue: liked ? 0.5 : 1, // Change opacity
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Dispatch the like/unlike message
        dispatch({ type: "SEND_MESSAGE", payload: { channel, message } });
    }, [textId, currentMemberId, liked, dispatch, scaleAnim, opacityAnim]);

    return (
        <View style={styles.container}>
            {/* Touchable heart icon */}
            <TouchableOpacity onPress={handleTextReaction} style={styles.likeContainer}>
                {/* Animated heart icon */}
                <Animated.Image
                    source={
                        liked
                            ? require("../../assets/images/heart.png")
                            : require("../../assets/images/heart (3).png")
                    }
                    style={[
                        styles.heartIcon,
                        {
                            transform: [{ scale: scaleAnim }], // Add scale animation
                        },
                    ]}
                />
                {/* Animated likes count */}
                <Animated.Text
                    style={[
                        styles.likes,
                        {
                            opacity: opacityAnim, // Add opacity animation
                        },
                    ]}
                >
                    {(likesCount === 0 || likesCount >= 10) ? likesCount : `0${likesCount}`}
                </Animated.Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "relative",
        alignItems: "center",
    },
    likeContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    heartIcon: {
        width: 23,
        height: 23,
    },
    likes: {
        fontSize: 14,
        color: "#555",
        fontFamily: "Inter_600SemiBold",
    },
});

export default LikeButton;