import React, {memo, useEffect, useRef, useState} from "react";
import {getPostResponseAction} from "../../service/actions/spaceActions";
import {
    ActivityIndicator,
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    Text,
    Vibration,
} from "react-native";
import {PostComments} from "./PostComments";
import {rem} from "../../utils/uiUtils";
import {useSelector} from "react-redux";
import {getEmojisByPostId} from "../../service/selectors/spaceSelectors";
import {useRouter} from "expo-router";
import {emojisInput} from "../../utils";

function PostResponses({postId, isFetched, dispatch, currentMemberId}) {
    const [loading, setLoading] = useState(true);

    const emojis = useSelector(state => getEmojisByPostId(state, postId));
    const members = useSelector(state => state.space.members);

    const router = useRouter();

    useEffect(() => {
        const getPostResponse = async () => {
            if (isFetched) return;
            setLoading(true);
            await dispatch(getPostResponseAction(postId));
            setLoading(false);
        }
        getPostResponse().finally(() => setLoading(false));
    }, [postId, isFetched, dispatch]);

    const handleNavigateToMemberPage = (emojiMemberId) => {
        Vibration.vibrate(70);
        if (emojiMemberId === currentMemberId) {
            router.push("./yourpage")
        } else {
            router.push({
                pathname: "./member/[memberId]",
                params: {memberId: emojiMemberId}
            })
        }
    }

    if (loading) {
        return <ActivityIndicator color={"#fff"} size={"large"}/>;
    }


    return (
        <View style={{flex: 1}}>
            {(isFetched && emojis?.length > 0) ? (
                <ScrollView horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.emojiContainer}
                >
                    {emojis?.map((e, index) => {
                        const member = members[e.emojiMember];
                        return (
                            <Pressable key={index}
                                       onPress={() => handleNavigateToMemberPage(member.memberId)}
                                       style={styles.emojiItem}
                            >
                                <Image source={{uri: member?.user?.profile}} altText="image"
                                       style={styles.profileImage}/>

                                <View style={styles.emojiIconContainer}>
                                    <Text style={styles.emojiIcon}>{emojisInput[e?.emojis]}</Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            ) : null}


            <PostComments
                postId={postId}
                isCommentsFetched={isFetched}
                currentMemberId={currentMemberId}
            />
        </View>
    );
}

export default memo(PostResponses);

const styles = StyleSheet.create({
    menu: {
        marginTop: rem(0.5),
        justifyContent: "space-evenly",
        alignItems: "center",
        flexDirection: "row",
        gap: 20
    },
    menuOption: {
        color: "#6f6f6f",
        fontSize: rem(1.5),
        fontFamily: "Inter_600SemiBold"
    },
    activeOption: {
        color: "#3c89fb"
    },
    emojiContainer: {
        paddingHorizontal: rem(2),
        flexDirection: "row",
        gap: 20,
        paddingVertical: rem(0.6)
    },
    emojiItem: {
        backgroundColor: "#1e1e1e",
        borderRadius: 50,
        padding: 2,
    },
    profileImage: {
        width: 56,
        height: 56,
        borderRadius: 50,
        objectFit: "contain"
    },
    emojiIconContainer: {
        position: "absolute",
        bottom: -4,
        right: -6,
        backgroundColor: "#000",
        borderWidth: 1,
        borderColor: "#1e1e1e",
        borderRadius: 50,
        padding: 1
    },
    emojiIcon: {
        fontSize: 17,
        padding: 1,
    },
    comment: {
        color: "#fff"
    }
})