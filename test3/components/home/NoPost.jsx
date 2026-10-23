import React, {memo} from "react";
import {Image, Pressable, Text, View, StyleSheet} from "react-native";
import {rem} from "../../utils/uiUtils";

function NoPost({member, router, currentMemberId}) {
    const { memberId, user } = member || {};

    const handleNavigateToMember = (memberId) => {
        if(currentMemberId === memberId) {
            router.push("../yourpage")
        } else {
            router.push({
                pathname: "../member/[memberId]",
                params: {memberId: memberId}
            });
        }
    }

    if(!memberId) return null;

    return (
        <View key={memberId} style={styles.noPostContainer}>
            <Pressable onPress={() => handleNavigateToMember(memberId)}>
                <View style={styles.noPostUserContainer}>
                    <Image source={{ uri: user?.profile }}
                        style={styles.noPostUserImage}
                        alt={`${user?.name} profile image`}
                    />
                    <View style={styles.noPostUserDetails}>
                        <Text style={styles.noPostUsername}>{user?.username}</Text>
                        <Text style={styles.noPostName}>{user?.name}</Text>
                    </View>
                </View>
            </Pressable>
            <View style={styles.noPostDiv}>
                <Image source={require("../../assets/images/image-.png")} style={{width: 50, height:50}}/>
                <Text style={styles.noPostDivText}>
                    No Posts from {user?.username} today
                </Text>
            </View>
            <View style={styles.postCaption}>
                <Text style={styles.postCaptionIcon}>:</Text>
                <Text style={styles.postCaptionText}>Post Expression</Text>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    noPostContainer: {
        marginBottom: rem(4.5)
    },
    noPostUserContainer: {
        marginVertical: rem(1),
        marginHorizontal: rem(1.7),
        flexDirection: "row",
        alignItems: "center",
        gap: rem(1.5)
    },
    noPostUserImage: {
        width: rem(4.6),
        height: rem(4.6),
        objectFit: "cover",
        borderRadius: 50,
    },
    noPostUserDetails: {
        gap: rem(0.5)
    },
    noPostUsername: {
        fontSize: rem(1.4),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.03),
        color: "#fff"
    },
    noPostName: {
        fontSize: rem(1.3),
        fontFamily: "Inter_600SemiBold",
        color: "#6f6f6f",
        letterSpacing: rem(0.02)
    },
    noPostDiv: {
        alignSelf: "center",
        width: "98%",
        aspectRatio: "1/1",
        justifyContent: "center",
        alignItems: "center",
        gap: 15,
        borderWidth: 1,
        borderColor: "#1e1e1e",
        borderRadius: 15,
        borderCurve: "continuous"
    },
    noPostDivText: {
        color: "#d9d9d9",
        fontFamily: "Inter_600SemiBold",
        fontSize: rem(1.3),
        letterSpacing: rem(0.02),
        paddingHorizontal: rem(1)
    },
    postCaption: {
        flexDirection: 'row',
        marginTop: rem(0.5),
        marginHorizontal: rem(1),
        alignItems: "baseline",
        gap: 6
    },
    postCaptionText: {
        fontSize: rem(1.4),
        fontFamily: "Inter_500Medium",
        color: "#fff"
    },
    postCaptionIcon: {
        fontSize: rem(1.4),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.03),
        color: "#3083FFFF",
    }
})


export default memo(NoPost);
