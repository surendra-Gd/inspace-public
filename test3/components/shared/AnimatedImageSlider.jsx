import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image"; // Since you’re using expo-image

const { width } = Dimensions.get("window");

const AnimatedImageSlider = ({
     images, animationDuration = 1000,
     delayBetweenImages = 2000, onLoad, onError,}
) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current; // For fading

    // Function to animate image transition
    const animateImage = useCallback(() => {
        Animated.sequence([
            // Fade-in
            Animated.timing(fadeAnim, {
                toValue: 1, // Fully visible
                duration: animationDuration, // Animation duration
                useNativeDriver: true,
            }),
            // Wait for a moment before transitioning to the next image
            Animated.delay(delayBetweenImages),
            // Fade-out
            Animated.timing(fadeAnim, {
                toValue: 0, // Fully invisible
                duration: animationDuration,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Move to the next image
            setCurrentImageIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        });
    }, [fadeAnim, animationDuration, delayBetweenImages, images.length]);

    // Use Effect to trigger animation cycle
    useEffect(() => {
        animateImage();
    }, [currentImageIndex, animateImage]);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.imageContainer,
                    {
                        opacity: fadeAnim, // Apply fading animation
                    },
                ]}
            >
                <Image
                    style={styles.image}
                    source={{ uri: images[currentImageIndex] }}
                    contentFit="cover"
                    onLoad={onLoad}
                    onError={onError}
                />
            </Animated.View>
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    imageContainer: {
        width: "100%", // Image container width
        aspectRatio: 1, // Image container height (aspect ratio 1:1)
        overflow: "hidden", // To clip image edges
        borderRadius: 10, // Rounded corners for better UI
    },
    image: {
        width: "100%",
        height: "100%",
    },
});

export default AnimatedImageSlider;