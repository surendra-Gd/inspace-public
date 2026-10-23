import React, { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { rem } from "../../utils/uiUtils";

const UserBio = ({ bio }) => {
    const [expanded, setExpanded] = useState(false);

    const bioLines = bio.split('\n'); // Split the bio into lines based on the newline character
    const previewLines = 4; // Number of lines to show initially

    // Show only the first 4 lines if not expanded
    const visibleLines = expanded ? bioLines : bioLines.slice(0, previewLines);

    return (
        <View style={styles.container}>
            {bioLines.length > previewLines ? (
                <>
                    <Text style={styles.userBio}>
                        {visibleLines.join('\n').trim()}{expanded ? "" : "..."}
                    </Text>

                    <TouchableOpacity
                        onPress={() => setExpanded(!expanded)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonText}>
                            {expanded ? 'Less' : 'More'}
                        </Text>
                    </TouchableOpacity>
                </>
            ) : (
                <Text style={styles.userBio}>{bio}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingRight: rem(1),
    },
    userBio: {
        paddingTop: rem(1.5),
        fontSize: rem(1.3),
        color: "#d9d9d9",
        fontFamily: "Inter_500Medium",
    },
    buttonText: {
        marginTop: rem(1),
        color: '#fff',
        fontSize: rem(1.4),
        fontFamily: "Inter_700Bold",
    },
});

export default UserBio;