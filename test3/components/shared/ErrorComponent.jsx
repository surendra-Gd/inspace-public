import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {rem} from "../../utils/uiUtils";

const ErrorComponent = ({ msg }) => {
    return (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{msg}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    errorContainer: {
        width: "85%",
        marginTop: rem(2),
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 0, 0, 0.52)",
        backgroundColor: "rgba(120, 52, 52, 0.78)",
        borderRadius: 5,
        alignItems: "center"
    },
    errorText: {
        color: "#ff0000",
        paddingVertical: rem(1),
        paddingHorizontal: rem(2),
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold",
        textAlign: "center"
    },
});

export default ErrorComponent;
