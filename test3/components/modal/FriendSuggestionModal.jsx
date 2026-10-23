import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {useRouter} from "expo-router";
import {rem} from "../../utils/uiUtils";

export const FriendSuggestionModal = () => {
    const router = useRouter();

    const handleNavigateToSearch = () => {
        router.push("/search");
    };

    return (
        <View style={styles.modalSection}>
            <Text style={styles.heading}>
                Start making friends!
            </Text>
            <Text style={styles.message}>
                Search for people below, and we’ll suggest more friends once you’ve added some!
            </Text>
            <TouchableOpacity onPress={handleNavigateToSearch} style={styles.exploreLink}>
                <Text style={styles.exploreLinkText}>Explore your friends</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    modalSection: {
        top: rem(1),
        paddingVertical: rem(2),
        paddingHorizontal: rem(1),
        alignItems: 'center',
    },
    heading: {
        fontSize: rem(2.2),
        color: "#ffe600",
        letterSpacing: 0.6,
        fontFamily: 'Inter_700Bold',
        marginBottom: rem(2),
        textAlign: 'center',
    },
    message: {
        paddingHorizontal: rem(1),
        fontSize: rem(1.6),
        fontFamily: 'Inter_500Medium',
        textAlign: 'center',
        marginBottom: rem(2),
        color: '#fff',
    },
    exploreLink: {
        marginTop: rem(3),
        backgroundColor: '#190908FF',
        paddingVertical: rem(1.1),
        paddingHorizontal: rem(5),
        borderRadius: 25,
        borderCurve: "circular"
    },
    exploreLinkText: {
        color: "#ff5722",
        fontSize: rem(1.6),
        fontFamily: "Inter_600SemiBold",
    },
});

export default FriendSuggestionModal;
