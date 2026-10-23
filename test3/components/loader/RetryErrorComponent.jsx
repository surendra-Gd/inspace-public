import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {rem} from "../../utils/uiUtils";
import * as Updates from "expo-updates";


const reloadApp = async () => {
    await Updates.reloadAsync();
};

export const RetryErrorComponent = ({ errorMessage }) => (
    <View style={styles.errorContainer}>
        <Text style={styles.heading}>Oops, something went wrong!</Text>
        <Text style={styles.message}>{errorMessage}</Text>
        <TouchableOpacity onPress={() => reloadApp()} style={styles.actionButton}>
            <Text style={styles.buttonText}>Reload</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    errorContainer: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: 'center',
        backgroundColor: "#000",
    },
    heading: {
        fontSize: rem(1.9),
        fontFamily: "Inter_700Bold",
        marginBottom: rem(1.5),
        color: '#FF5C5C', // Replace with error color
    },
    message: {
        fontSize: rem(1.6),
        fontFamily: "Inter_500Medium",
        textAlign: "center",
        paddingHorizontal: rem(1.8),
        marginBottom: 40,
        color: '#d9d9d9',
    },
    actionButton: {
        backgroundColor: '#ADD8E6',
        paddingVertical: rem(0.6),
        width: "75%",
        borderRadius: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontFamily: "Inter_800ExtraBold"
    },
});

export default RetryErrorComponent;
