import React, {useState} from "react";
import {
    ActivityIndicator,
    Modal,
    Text,
    View,
    Image,
    StyleSheet, FlatList, Pressable
} from "react-native";
import {useDispatch} from "react-redux";
import {emojisInput} from "../../utils";
import {removeEmojiAction} from "../../service/actions/spaceActions";
import {useRouter} from "expo-router";

const emojiStyle = {
    "LOVE": "#FF1493",       // Bright Pink (vibrant and fun)
    "LIKE": "#FF4500",       // Orange Red (energetic and bold)
    "SMILE": "#00FF00",      // Neon Green (modern and eye-catching)
    "SLEEPY": "#FFD700",     // Gold (warm and playful)
    "LAUGH_TEAR": "#00FFFF"  // Cyan (bright and fresh)
};


export const EmojisModal = (
    {emojis, members, currentMemberId, handleNavigateToMember, onClose, visible}
) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleRemove = (emojiId) => {
        if(loading) return;
        setLoading(true);
        try {
            dispatch(removeEmojiAction(emojiId))
        } finally {
            setLoading(false);
        }
    }

    const renderItem = ({item}) => {
        const member = members[item?.emojiMember];
        const isCurrentMember = member.memberId === currentMemberId;

        return (
            <>
                <Pressable onPress={() => isCurrentMember ? handleRemove(item.emojiId) : handleNavigateToMember(member.memberId)}
                           style={styles.memberCard}>
                    <Image source={{uri: member.user.profile}} style={styles.profileImage}/>
                    <View style={styles.userDetails}>
                        <Text style={styles.username}>{member.user.username}</Text>
                        <Text style={styles.name}>{member.user.name}</Text>
                    </View>
                    {(loading && isCurrentMember) ? (
                        <ActivityIndicator size={20} color={"#fff"} style={styles.loadingBar} />
                    ) : (
                        <Text style={[styles.emojiIcon, {backgroundColor: emojiStyle[item?.emojis]}]}>{emojisInput[item?.emojis]}</Text>
                    )}
                    </Pressable>
                {isCurrentMember ? (
                    <View style={styles.removeContainer}>
                        <Text style={styles.removeText}>Tap to remove.</Text>
                    </View>
                ) : null}
            </>
        );
    }


    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={() => onClose()}>
            <View style={styles.modalOverlay} pointerEvents="box-none">
                <View style={styles.modalContainer}>
                    <FlatList
                        data={emojis}
                        keyExtractor={(item) => item.emojiId?.toString()}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        style={styles.membersContainer}
                    />
                </View>
            </View>
        </Modal>
    );

};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContainer: {
        width: '100%',
        height: '80%',
        backgroundColor: '#1e1e1e',
        borderRadius: 20,
        padding: 10,
    },
    membersContainer: {
        paddingVertical: 10,
        marginHorizontal: 10
    },
    memberCard: {
        marginVertical: 10,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 15
    },
    userDetails: {
        flexDirection: "column",
        rowGap: 3,
        flex: 1
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 30,
        marginBottom: 5,
        borderColor: "#000",
        borderWidth: 2
    },
    name: {
        fontSize: 13,
        color: "#6f6f6f",
        fontFamily: "Inter_600SemiBold",
        letterSpacing: 0.3
    },
    username: {
        fontSize: 13,
        color: "#fff",
        fontFamily: "Inter_600SemiBold",
        letterSpacing: 0.3
    },
    loadingBar: {
        marginTop: 10,
        alignSelf: "center",
        right: 15,
    },
    emojiIcon: {
        borderRadius: 50,
        paddingHorizontal: 2,
        paddingVertical: 1,
        right: 8,
        alignSelf: "center",
        fontSize: 18
    },
    removeContainer: {
        paddingTop: 8,
        marginLeft: 50,
        marginBottom: 15,
    },
    removeText: {
        position: "absolute",
        bottom: 0,
        color: "#3c89fb",
        fontSize: 13,
        fontFamily: "Inter_500Medium",
    }
});

export default EmojisModal;