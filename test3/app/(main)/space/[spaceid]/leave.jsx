import React, { useState } from "react";
import {useDispatch, useSelector} from "react-redux";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import {getCurrentSpace} from "../../../../service/selectors/spaceSelectors";
import {useRouter} from "expo-router";
import {rem} from "../../../../utils/uiUtils";
import {leaveSpaceAction} from "../../../../service/actions/spaceActions";

export default function InSpaceLeave() {
    const router = useRouter();
    const [feedback, setFeedback] = useState("");
    const dispatch = useDispatch();

    const { currentMember, spaceId } = useSelector(getCurrentSpace);
    const { memberId, admin } = currentMember;
    const feedbackRegex = /^[^<>]*.{1,200}$/;

    const [loading, setLoading] = useState(false);

    if (admin) {
        return (
            <View style={styles.container}>
                <Text style={styles.shiftAdminMessage}>
                    Please shift your admin role to another member before leaving the space.
                </Text>
            </View>
        );
    }

    const handleLeaveAction = async () => {
        if (feedback.length < 10) {
            Toast.show({ type: "error", text1: "Please enter at least 10 characters" });
        } else if (!feedbackRegex.test(feedback)) {
            Toast.show({ type: "error", text1: "Your feedback contains invalid characters" });
        } else {
            setLoading(true);
            await dispatch(leaveSpaceAction(memberId, feedback, spaceId, router));
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Leave Space</Text>

            <View style={styles.consPoints}>
                {[
                    "When you leave this space, all your posts, memories will be permanently deleted.",
                    "You can't access the space or see what's inside the space.",
                    "Rejoining this space means starting new with all your content erased.",
                    "Leave means missing out on what's happening inside this space."
                ].map((message, index) => (
                    <View key={index} style={styles.consPoint}>
                        <Text style={styles.pointIndex}>{index + 1}</Text>
                        <Text style={styles.pointMessage}>{message}</Text>
                    </View>
                ))}
            </View>

            <TextInput style={styles.feedbackInput}
                value={feedback}
                onChangeText={setFeedback}
                maxLength={200}
                multiline
                placeholder="Reason for leaving"
                placeholderTextColor={"#6f6f6f"}
                editable={!loading}
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.leaveButton}
                    disabled={loading || !feedback}
                    onPress={handleLeaveAction}
                >
                    <Text style={styles.leaveButtonText}>
                        {loading ? "Leaving..." : "Leave"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()} disabled={loading} style={styles.stayButtonContainer}>
                    <Text style={styles.stayButtonText}>Back to Stay</Text>
                </TouchableOpacity>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        flex: 1,
        top: rem(7),
        padding: rem(0.5)
    },
    heading: {
        fontSize: rem(2.5),
        fontFamily: "Inter_700Bold",
        paddingTop: rem(0.5),
        paddingLeft: rem(2.5),
        letterSpacing: rem(0.03),
        color: "#fff"
    },
    consPoints: {
        marginVertical: rem(2.5),
        marginRight: rem(1),
        paddingHorizontal: rem(1.5),
        gap: 20
    },
    consPoint: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 10
    },
    pointIndex: {
        backgroundColor: "#3D444AFF",
        width: 20,
        height: 20,
        fontSize: rem(1.2),
        fontFamily: "Inter_500Medium",
        alignSelf: "center",
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 50,
        color: "#fff"
    },
    pointMessage: {
        color: "#3083FF",
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.03)
    },
    feedbackInput: {
        marginVertical: rem(2.5),
        backgroundColor: "#1E1E1EFF",
        width: "98%",
        minHeight: 110,
        maxHeight: 155,
        alignSelf: "center",
        color: "#fff",
        fontSize: rem(1.5),
        fontFamily: "Inter_500Medium",
        paddingTop: rem(1),
        paddingBottom: rem(2),
        paddingHorizontal: rem(2),
        letterSpacing: rem(0.01),
        borderRadius: 16,
        textAlignVertical: "top"
    },
    buttonContainer: {
        marginTop: rem(6),
        justifyContent: "center",
    },
    leaveButton: {
        backgroundColor: "#fff",
        paddingVertical: rem(1.2),
        marginHorizontal: rem(1),
        borderRadius: 15,
        alignItems: "center",
    },
    leaveButtonText: {
        color: "#000",
        fontSize: rem(1.6),
        fontFamily: "Inter_800ExtraBold",
        textTransform: "uppercase",
        letterSpacing: rem(0.05)
    },
    stayButtonContainer: {
        marginTop: rem(3),
        flexDirection: "row",
        alignItems: "center",
        gap: rem(0.2),
        alignSelf: "center"
    },
    stayButtonText: {
        fontSize: rem(1.5),
        fontFamily: "Inter_800ExtraBold",
        color: "#6f6f6f"
    },
    shiftAdminMessage: {
        alignSelf: "center",
        textAlign: "center",
        width: "95%",
        paddingVertical: rem(1.5),
        paddingHorizontal: rem(2),
        top: rem(10),
        color: "#3083FFFF",
        backgroundColor: "#fff",
        fontSize: rem(1.5),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.03),
        borderRadius: 10
    }
});