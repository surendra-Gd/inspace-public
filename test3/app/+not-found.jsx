import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function NotFoundScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Emoji for visual appeal */}
            <Text style={styles.emoji}>😕</Text>

            {/* Title */}
            <Text style={styles.title}>Oops! Page Not Found</Text>

            {/* Friendly message */}
            <Text style={styles.message}>
                Looks like you took a wrong turn. Don't worry, let's get you back on track!
            </Text>

            {/* Button to go back */}
            <Pressable onPress={() => router.replace("/")} style={styles.button}>
                <Text style={styles.buttonText}>Explore More</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000", // Black background
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
        padding: 20,
    },
    emoji: {
        fontSize: 60,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontFamily: "Inter_700Bold",
        marginBottom: 16,
        color: "#ff2020", // Bright red for emphasis
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        fontFamily: "Inter_600SemiBold",
        textAlign: 'center',
        marginBottom: 30,
        color: "#d9d9d9", // Light gray for readability
        lineHeight: 24, // Improve readability
    },
    button: {
        backgroundColor: "#3c89fb", // Bright blue for the button
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 25, // Rounded corners
        shadowColor: "#3c89fb", // Glow effect
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5, // For Android shadow
    },
    buttonText: {
        color: "#fff", // White text for contrast
        fontFamily: "Inter_700Bold",
        fontSize: 16,
        textAlign: 'center',
    },
});