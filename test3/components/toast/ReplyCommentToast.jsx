import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import {useRouter} from "expo-router";

const ReplyCommentToast = ({ props }) => {
    const { profile, username, comment, reply, onClick } = props || {};
    const router = useRouter();

    return (
        <TouchableOpacity onPress={() => onClick(router)} style={styles.messageToastContainer}>
            <View style={styles.messageToastHead}>
                <View style={styles.usernameContainer}>
                    <Text style={styles.messageTitle}>New Reply 💬</Text>
                    {username && <Text style={styles.username}>@{username}</Text>}
                </View>
                {profile && (
                    <Image
                        source={{ uri: profile }}
                        style={styles.toastIcon}
                    />
                )}
            </View>
            <Text style={styles.messageCommentText} numberOfLines={2}>{comment}</Text>
            <View style={styles.messageBodyContainer}>
                {comment && <Text style={styles.mainMessageBody} numberOfLines={2}>{reply}</Text>}
            </View>
        </TouchableOpacity>
    );
};

export default ReplyCommentToast;

const styles = StyleSheet.create({
    messageToastContainer: {
        width: "96%",
        flexDirection: "column",
        backgroundColor: "#1E1E1E", // Dark background
        padding: 12,
        borderRadius: 20,
        gap: 8,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: "#333333", // Subtle border for depth
    },
    messageToastHead: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between", // Align items to the edges
        width: "100%",
    },
    usernameContainer: {
        flexDirection: "column",
        gap: 2,
    },
    username: {
        color: "#A0A0A0", // Light gray for secondary text
        fontSize: 12,
        fontFamily: "Inter_500Medium",
    },
    toastIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
    },
    postImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        resizeMode: "cover",
        alignSelf: "flex-end", // Align post image to the right
    },
    messageTitle: {
        color: "#6BFF8E", // Bright green for replies
        fontSize: 14,
        fontFamily: "Inter_700Bold",
    },
    messageBodyContainer: {
        width: "100%",
        flexDirection: "column",
        gap: 5,
        backgroundColor: "#2A2A2A", // Slightly lighter dark background
        borderRadius: 10,
        padding: 8,
    },
    mainMessageBody: {
        color: "#FFFFFF", // White for primary text
        fontSize: 13,
        fontFamily: "Inter_600SemiBold",
    },
    messageCommentText: {
        fontSize: 14,
        color: "#dfdfdf",
        fontFamily: "Inter_400Medium"
    }
});