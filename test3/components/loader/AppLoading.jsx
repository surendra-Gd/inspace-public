import React, {memo} from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';
import {rem} from "../../utils/uiUtils";

const AppLoading = () => {
    const fadeAnim = new Animated.Value(0);

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);



    return (
        <View style={styles.container}>
            <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>
                InSpace
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    text: {
        fontSize: rem(4.1),
        fontWeight: "700",
        color: 'white',
        textAlign: 'center',
        letterSpacing: 0.4
    },
});

export default memo(AppLoading);
