import {useRouter} from "expo-router";
import {TouchableOpacity, View, Text, StyleSheet} from "react-native";
import {rem} from "../../utils/uiUtils";

export default function AccessDenied() {
    const router = useRouter();
    const handleNavigationToHome = () => {
        router.replace("/");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Access Denied.</Text>
            <Text style={styles.message}>
                You do not have permission to access this page.
            </Text>
            <TouchableOpacity onPress={handleNavigationToHome} style={styles.button}>
                <Text style={styles.buttonText}>Take me home</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        flex: 1
    },
    heading: {
        marginTop: rem(15),
        textAlign: "center",
        fontSize: rem(2.2),
        fontFamily: "Inter_700Bold",
        marginBottom: rem(1),
        color: "#e74c3c"
    },
    message: {
        color: "#d9d9d9",
        textAlign: "center",
        fontSize: rem(1.6),
        fontFamily:  "Inter_500Medium",
        marginTop: rem(2),
        paddingHorizontal: rem(1),
        marginBottom: rem(4),
    },
    button: {
        alignItems: "center",
        justifyContent: "center",
        width: "80%",
        alignSelf: "center",
        backgroundColor: "#3083FFFF",
        paddingVertical: rem(0.5),
        paddingHorizontal: rem(2),
        borderRadius: 6
    },
    buttonText: {
        fontSize: rem(1.6),
        fontFamily: "Inter_700Bold",
        color: "#000"
    }
})