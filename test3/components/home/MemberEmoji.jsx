import React, {useState, memo} from "react";
import {View, Text, StyleSheet, Image, Pressable, ActivityIndicator} from 'react-native';
import {useDispatch, useSelector} from "react-redux";
import {addEmojiAction, removeEmojiAction} from "../../service/actions/spaceActions";
import {MEMBER_EMOJI_FAILED} from "../../service/constants/spaceConstants";
import {emojisInput, useDisplayEmojis} from "../../utils";
import {rem} from "../../utils/uiUtils";
import {selectEmojiByMemberId} from "../../service/selectors/spaceSelectors";

// Todo: UI on emojis
const MemberEmoji = ({postId, memberId}) => {
    const dispatch = useDispatch();

    const [showEmojis, setShowEmojis] = useState(false);
    const [loading, setLoading] = useState(false);

    const memberEmoji = useSelector((state) =>
        selectEmojiByMemberId(state, memberId, postId)
    );

    // Todo: Error on all emojis not single member emoji.
    const {errors} = useSelector(state => state.app);
    const emojiError = errors[postId]?.error === MEMBER_EMOJI_FAILED || false;


    const onChange = async (emojiType) => {
        const formData = {
            emojis: emojiType,
            postId: postId
        };
        setLoading(true);
        dispatch(addEmojiAction(postId, formData, memberId))
            .finally(() => {
                setShowEmojis(false);
                setLoading(false);
            });
    };

    const UiEmojis = useDisplayEmojis({showEmojis, setShowEmojis, onChange, styles});

    return (
        <View style={styles.emojiSection}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#d9d9d9"/>
                </View>
            ) : emojiError ? (
                <View style={styles.errorIcon}>
                    <Image source={require("../../assets/images/warning.png")} style={{width: 20, height: 20}}/>
                    <Text style={styles.errorTxt}>Error</Text>
                </View>
            ) : (memberEmoji ? null : UiEmojis)}
        </View>
    );
};

const styles = StyleSheet.create({
    emojiSection: {
        position: "absolute",
        bottom: "4%",
        right: "4%"
    },
    loadingContainer: {
        position: "relative",
        top: 0,
        left: 0,
        height: 30,
        width: 30,
    },
    errorIcon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedEmoji: {
        position: "relative",
        borderRadius: 50,
        paddingTop: rem(1),
    },
    removeIcon: {
        position: "absolute",
        left: "55%",
        top: 0,
        // padding: rem(0.5),
        zIndex: 1000
    },
    userSelected: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        // padding: rem(0.6),
        backgroundColor: "#3c89fb",
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#0264ff"
    },
    userSelectedText: {
        fontSize: rem(2.2)
    },
    emojisList: {
        gap: 15,
        flexDirection: "row",
        zIndex: 2000
    },
    emojiBtn: {
        backgroundColor: "#000",
        padding: rem(0.3),
        alignItems: "center",
        justifyContent: "center",
        // borderWidth: 1,
        // borderColor: "#1e1e1e",
        borderRadius: 50,
    },
    cancelBtn: {
        fontSize: 20,
        width: 25,
        height: 6,
        borderRadius: 50,
        backgroundColor: "#fff"
    },
    defaultEmojiBtn: {
        backgroundColor: "#000",
        padding: rem(0.3),
        aspectRatio: "1/1",
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center"
    },
    emojiText: {
        fontSize: rem(2.2)
    },
    errorTxt: {
        fontFamily: "Inter_800ExtraBold",
        fontSize: rem(1.2),
        color: "red"
    }
});

export default memo(MemberEmoji);