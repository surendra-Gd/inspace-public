import React from "react";
import { Text, StyleSheet } from "react-native";
import {rem} from "../../utils/uiUtils";

export const DateBanner = () => {
    const date = new Date();

    const formattedDate = `${date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`}-` +
        `${date.getMonth() > 8 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`}-` +
        `${date.getFullYear()}`;

    return (
        <Text style={styles.dateText}>
            {formattedDate}
        </Text>
    );
};

const styles = StyleSheet.create({
    dateText: {
        top: rem(1.1),
        paddingVertical: rem(0.2),
        paddingHorizontal: rem(1.3),
        textAlign: "center",
        borderRadius: 6,
        backgroundColor: "#fff",
        alignSelf: "center",
        fontSize: rem(1.4),
        fontFamily: "Inter_700Bold",
        color: '#000',
        marginBottom: rem(3.5),
        letterSpacing: rem(0.02)
    },
});