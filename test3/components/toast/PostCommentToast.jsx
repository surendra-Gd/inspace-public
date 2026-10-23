import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import {useRouter} from "expo-router";

const PostCommentToast = ({ props }) => {
    const { profile, username, post, comment, onClick } = props || {};
    const router = useRouter();

    return (
        <TouchableOpacity onPress={() => onClick(router)} style={styles.messageToastContainer}>
            <View style={styles.messageToastHead}>
                {profile && (
                    <Image
                        source={{ uri: profile }}
                        style={styles.toastIcon}
                    />
                )}
                <View style={styles.usernameContainer}>
                    <Text style={styles.messageTitle}>New Comment 🎉</Text>
                    {username && <Text style={styles.username}>@{username}</Text>}
                </View>
                {post && (
                    <Image
                        source={{ uri: post }}
                        style={styles.postImage}
                    />
                )}
            </View>
            <View style={styles.messageBodyContainer}>
                {comment && <Text style={styles.mainMessageBody} numberOfLines={3}>{comment}</Text>}
            </View>
        </TouchableOpacity>
    );
};

export default PostCommentToast;

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
        gap: 10,
        width: "100%",
    },
    usernameContainer: {
        flex: 1,
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
        borderColor: "#FF6B6B", // Vibrant accent color
    },
    postImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        objectFit: "cover",
        borderWidth: 1,
        borderColor: "#dfdfdf"
    },
    messageTitle: {
        color: "#FF6B6B", // Vibrant accent color
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
        color: "#FFFFFF",
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
    },
});