import {Text, View, StyleSheet} from "react-native";
import React from "react";
import {rem} from "../../utils/uiUtils";

export default function ValidationError({errors}) {
    return (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    errorContainer: {
        marginTop: rem(0.6),
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    errorText: {
        color: "#FF0000FF",
        fontSize: rem(1.3),
        fontFamily: "Inter_500Medium",
        marginLeft: rem(1),
        marginBottom: rem(1)
    },
})