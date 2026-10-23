import React, {memo, useState} from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import {rem} from "../../utils/uiUtils";

import {Image} from "expo-image";

const DisplayImage = ({ image, altText, style }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    return (
        <View style={styles.container}>

            {(loading && !error) && (
                <ActivityIndicator size="small" color="#fff" style={{position: "absolute", top: "50%", alignSelf: "center"}}/>
            )}


            {!error ? (
                <Image source={{ uri: image }}
                    onLoad={() => setLoading(false)} onError={handleError}
                    style={styles.image}
                    contentFit="contain"
                />
            ) : (
                <View style={styles.errorContainer}>
                    <Image source={require("../../assets/images/picture.png")} style={{width: 40, height: 40}} />
                    <Text style={styles.errorMessage}>
                        Image failed to load.
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#efefef",
        borderRadius: 10
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
        borderWidth: 1,
        // backgroundColor: "#efefef"
    },
    errorContainer: {
        backgroundColor: "#1e1e1e",
        height: "100%",
        width: "100%",
        borderRadius: 15,
        borderCurve: "continuous",
        alignItems: "center",
        justifyContent: "center",
    },
    errorMessage: {
        fontSize: rem(1.3),
        fontFamily: "Inter_700Bold",
        color: "red"
    }
});

export default memo(DisplayImage);


// import React, { useState } from 'react';
// import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
// import {Gesture, GestureDetector, GestureHandlerRootView} from 'react-native-gesture-handler';
// import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
// import { memo } from 'react';
//
// import {Image} from "expo-image";
//
// const DisplayImage = ({ image, altText, style }) => {
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(false);
//
//     const scale = useSharedValue(1); // For zooming
//     const offsetX = useSharedValue(0); // Horizontal translation
//     const offsetY = useSharedValue(0); // Vertical translation
//
//     const handleError = () => {
//         setLoading(false);
//         setError(true);
//     };
//
//     const zoomGesture = Gesture.Pinch()
//         .onUpdate((event) => {
//             scale.value = event.scale;
//         })
//         .onEnd(() => {
//             scale.value = withSpring(1); // Reset scale after gesture ends
//         });
//
//     const panGesture = Gesture.Pan()
//         .onUpdate((event) => {
//             offsetX.value += event.translationX;
//             offsetY.value += event.translationY;
//         })
//         .onEnd(() => {
//             offsetX.value = withSpring(0); // Reset position
//             offsetY.value = withSpring(0);
//         });
//
//     const animatedStyle = useAnimatedStyle(() => ({
//         transform: [
//             { scale: scale.value },
//             { translateX: offsetX.value },
//             { translateY: offsetY.value },
//         ],
//     }));
//
//     return (
//         <View style={styles.container}>
//             {loading && !error && (
//                 <ActivityIndicator
//                     size="small"
//                     color="#fff"
//                     style={{ position: "absolute", top: "50%", alignSelf: "center" }}
//                 />
//             )}
//
//             {!error ? (
//
//                 <GestureHandlerRootView style={{flex: 1}}>
//                     <GestureDetector gesture={Gesture.Simultaneous(zoomGesture, panGesture)}>
//                         <Animated.Image
//                             source={{ uri: image }}
//                             onLoad={() => setLoading(false)}
//                             onError={handleError}
//                             style={[styles.image, animatedStyle]}
//                             resizeMode="contain"
//                         />
//                     </GestureDetector>
//                 </GestureHandlerRootView>
//             ) : (
//                 <View style={styles.errorContainer}>
//                     <Image source={require("../../assets/images/picture.png")} style={{ width: 40, height: 40 }} />
//                     <Text style={styles.errorMessage}>
//                         Image failed to load.
//                     </Text>
//                 </View>
//             )}
//         </View>
//     );
// };
//
// const styles = StyleSheet.create({
//     container: {
//         height: "100%",
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: "#000",
//     },
//     image: {
//         width: '100%',
//         height: "100%",
//         borderRadius: 10,
//         borderColor: "#111",
//         borderWidth: 1,
//     },
//     errorContainer: {
//         backgroundColor: "#1e1e1e",
//         height: "100%",
//         width: "100%",
//         borderRadius: 15,
//         alignItems: "center",
//         justifyContent: "center",
//     },
//     errorMessage: {
//         fontSize: 16,
//         fontFamily: "Inter_700Bold",
//         color: "red",
//     },
// });
//
// export default memo(DisplayImage);