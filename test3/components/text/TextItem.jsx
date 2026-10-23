import {useSelector} from "react-redux";
import {usePathname, useRouter} from "expo-router";
import {selectMemberById} from "../../service/selectors/spaceSelectors";
import React, {Fragment, memo, useState} from "react";
import {REMOVE_UNSEEN_MESSAGES} from "../../service/constants/spaceConstants";
import {Pressable, Text, TouchableOpacity, View, StyleSheet, Image} from "react-native";
import DeleteTextModal from "../modal/DeleteTextModal";
import {rem} from "../../utils/uiUtils";
import LikeButton from "../shared/LikeButton";
import {REMOVE_UNSEEN_ITEM} from "../../service/constants/appConstants";
import {selectUnseenMessageCountByTextId} from "../../service/selectors/appSelectors";
import moment from "moment";
import ShowTagModal from "../modal/ShowTagModal";

const TextItem = ({item, currentMemberId, dispatch}) => {
    const {text, createdOn, anonymous, likesCount, liked, memberId, textId, messagesCount} = item;

    const router = useRouter();
    const pathname = usePathname();
    const [modalOpen, setModalOpen] = useState(false);
    const member = useSelector(state => selectMemberById(state, memberId))
    const badges = useSelector(state =>
        selectUnseenMessageCountByTextId(state, textId)
    );

    const [tag, setTag] = useState(false);

    const time = moment(createdOn).format('MMM D, YYYY h:mm A');

    const handleNavigateToTextView = () => {
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length >= 2) {
            const basePath = segments.slice(0, 2).join('/');
            router.push({
                pathname: `/${basePath}/text/[textId]`,
                params: {textId},
            });
        }
    };

    const handleMemberNavigation = (memberId) => {
        setTag(false);

        setTimeout(() => {
            if (currentMemberId === memberId) {
                router.push("../yourpage");
            } else {
                router.push({
                    pathname: "../member/[memberId]",
                    params: { memberId },
                });
            }
        }, 300);
    };


    if (!member) return null;

    return (
        <Fragment>
            <Pressable onPress={handleNavigateToTextView} style={styles.container}>
                {!anonymous && (
                    <View style={styles.postUserContainer}>
                        <Image source={{uri: member?.user?.profile}} style={styles.postUserImage} alt="Profile"/>
                        <View style={styles.postUserDetails}>
                            <Text style={styles.postUserName}>{member?.user.username}</Text>
                            <Text style={styles.name}>{member?.user.name}</Text>
                        </View>
                    </View>
                )}
                <View style={styles.textContainer}>
                    <Text style={styles.text}>{text}</Text>
                    <Text style={styles.timestamp}>{time}</Text>
                    {badges > 0 && (
                        <View style={styles.unseenIcon}>
                            <Text style={styles.unseenIconText}>
                                {badges}
                            </Text>
                        </View>
                    )}
                    {item.tagged.length > 0 && (
                        <Pressable onPress={() => setTag(true)} style={styles.userTag}>
                            <Image source={require("../../assets/images/user-tag.png")}
                                   style={{width: 30, height: 30}}/>
                        </Pressable>
                    )}
                </View>
                <View style={styles.meta}>
                    <View style={styles.commentContainer}>
                        <Image source={require("../../assets/images/comment.png")} style={{width: 25, height: 25}}/>
                        <Text style={styles.commentText}>
                            {(messagesCount === 0 || messagesCount >= 10) ? messagesCount : `0${messagesCount}`}
                        </Text>
                    </View>
                    <LikeButton
                        liked={liked}
                        dispatch={dispatch}
                        currentMemberId={currentMemberId}
                        textId={textId}
                        likesCount={likesCount}
                    />
                </View>
                {currentMemberId === memberId && (
                    <TouchableOpacity onPress={() => setModalOpen(true)} style={styles.deleteContainer}>
                        <Image source={require("../../assets/images/delete (3).png")} style={{width: 25, height: 25}}/>
                    </TouchableOpacity>
                )}
            </Pressable>
            {modalOpen && (
                <DeleteTextModal
                    textId={textId}
                    memberId={currentMemberId}
                    dispatch={dispatch}
                    onClose={() => setModalOpen(false)}
                    isVisible={modalOpen}
                />
            )}

            {tag && (
                <ShowTagModal
                    tagged={item.tagged}
                    isVisible={tag}
                    onClose={() => setTag(false)}
                    handleMemberNavigation={handleMemberNavigation}
                />
            )}

        </Fragment>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: rem(1),
        borderBottomWidth: 1,
        borderBottomColor: "#6f6f6f",
        position: "relative",
    },
    postUserContainer: {
        paddingTop: 4,
        paddingHorizontal: rem(1),
        flexDirection: "row",
        alignItems: "center",
        gap: rem(1.5),
    },
    postUserImage: {
        width: rem(4.6),
        height: rem(4.6),
        objectFit: "cover",
        borderRadius: 50,
    },
    postUserDetails: {
        gap: rem(0.5),
    },
    postUserName: {
        fontSize: rem(1.4),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.03),
        color: "#fff",
    },
    name: {
        fontSize: rem(1.3),
        fontFamily: "Inter_600SemiBold",
        color: "#6f6f6f",
        letterSpacing: rem(0.02),
    },
    textContainer: {
        paddingTop: rem(1),
        paddingBottom: rem(1),
        paddingHorizontal: rem(1),
        flexDirection: "column",
        marginTop: rem(1),
    },
    text: {
        fontSize: 16,
        fontFamily: "Inter_600SemiBold",
        color: "#fff",
        marginBottom: 5,
    },
    timestamp: {
        fontSize: 12,
        fontFamily: "Inter_500Medium",
        color: "#888",
        marginBottom: 10,
    },
    meta: {
        flexDirection: "row",
        alignSelf: "flex-end",
        justifyContent: "center",
        gap: 30,
        right: 22,
        paddingBottom: rem(1),
    },
    likeContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    likes: {
        fontSize: 14,
        color: "#555",
        fontFamily: "Inter_600SemiBold",
    },
    commentContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    commentText: {
        color: "#555",
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
    },
    deleteContainer: {
        position: "absolute",
        bottom: 30,
        left: 20,
    },
    unseenIcon: {
        position: "absolute",
        right: 30,
        bottom: 40,
        backgroundColor: "yellow",
        width: 20,
        height: 20,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4,
        alignSelf: "center"
    },
    unseenIconText: {
        borderRadius: 10,
        fontSize: 12,
        textAlign: "center",
        verticalAlign: "middle",
        fontFamily: "Inter_600SemiBold",
        color: "#000"
    },
    userTag: {
        position: "absolute",
        right: 20,
        top: 0
    }
});

export default memo(TextItem);