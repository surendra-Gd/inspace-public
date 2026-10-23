import { Fragment, useEffect, useState } from "react";
import { Image, Modal, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

export default function ProfileImageViewer({ profilePic, picStyle }) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const translateY = useSharedValue(0);

    const isDefault = profilePic?.includes("default_user_avatar.png");

    const panGesture = Gesture.Pan()
        .onUpdate((eve) => {
            translateY.value = eve.translationY;
        })
        .onEnd(() => {
            if (translateY.value > 150 || translateY.value < -150) {
                // Close the modal if the downward swipe is more than 150 pixels
                translateY.value = withSpring(translateY.value, {}, () => {
                    runOnJS(setIsModalVisible)(false);
                });
            } else {
                // Return to original position if swipe is less than 150 pixels
                translateY.value = withSpring(0);
            }
        });

    useEffect(() => {
        if (!isModalVisible) {
            translateY.value = 0;
        }
    }, [isModalVisible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }]
    }));

    const openModal = () => {
        if(isDefault || !profilePic) return;
        setIsModalVisible(true);
    }

    return (
        <Fragment>
            <TouchableOpacity onPress={openModal}>
                {profilePic && (
                    <Image source={{ uri: profilePic }} style={picStyle} />
                )}
            </TouchableOpacity>
            {isModalVisible && (
                <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
                    <GestureHandlerRootView style={styles.modalBackground}>
                        <GestureDetector gesture={panGesture}>
                            <Animated.View style={animatedStyle}>
                                <Animated.Image source={{ uri: profilePic }} style={styles.image} />
                            </Animated.View>
                        </GestureDetector>
                    </GestureHandlerRootView>
                </Modal>
            )}
        </Fragment>
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.91)"
    },
    image: {
        width: width,
        height: height,
        resizeMode: "contain",
        alignSelf: "center"
    }
});