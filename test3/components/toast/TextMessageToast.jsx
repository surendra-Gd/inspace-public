import {Image, Text, TouchableOpacity, View, StyleSheet} from "react-native";
import {useRouter} from "expo-router";

const TextMessageToast = ({text2, onClick, profile, text}) => {
    const router = useRouter();

    return (
        <TouchableOpacity onPress={() => onClick(router)} style={styles.messageToastContainer}>
            <Text style={styles.messageTitle}>{"New text message just dropped in the \nchat! 💬🚀"}</Text>
            {text && <Text style={styles.mainMessageBody} numberOfLines={2}>{text}</Text>}
            <View style={styles.messageBodyContainer}>
                {profile && (<Image
                    source={{uri: profile}}
                    style={styles.toastIcon}
                />)}
                {text2 && <Text style={styles.messageBody} numberOfLines={2}>{text2}</Text>}
            </View>
        </TouchableOpacity>
    )
}

export default TextMessageToast;

const styles = StyleSheet.create({
    messageToastContainer: {
        width: "96%",
        flexDirection: "column",
        backgroundColor: "#333333",
        padding: 10,
        borderRadius: 20,
        gap: 5,
        alignItems: "flex-start",
    },
    toastIcon: {
        width: 30,
        height: 30,
        backgroundColor: "#000",
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#000"
    },
    messageTitle: {
        color: "#FF8C00",
        fontSize: 13,
        fontFamily: "Inter_600SemiBold",
    },
    messageBodyContainer: {
        flexDirection: "row",
        gap: 10,
        backgroundColor: "#3c89fb",
        borderRadius: 8,
        width: "100%",
        paddingVertical: 5,
        paddingHorizontal: 10,
        minHeight: 50,
        maxHeight: 100,
    },
    messageBody: {
        color: "#000",
        fontSize: 13,
        fontFamily: "Inter_500Medium",
        marginRight: 10,
    },
    mainMessageBody: {
        color: "#fff",
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
        marginRight: 10,
        flex: 1,
    },
});