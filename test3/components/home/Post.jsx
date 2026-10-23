import React, {memo, useState} from "react";
import {View, Text, Image, StyleSheet, Pressable, Modal} from 'react-native';
import DeletePostModal from "../modal/DeletePostModal";
import DisplayImage from "../shared/DisplayImage";
import MemberEmoji from "./MemberEmoji";
import {rem} from "../../utils/uiUtils";
import {usePathname} from "expo-router";
import moment from "moment";
import {useSelector} from "react-redux";
import {getEmojisByPostId, selectMemberById, selectSpaceMembersObj} from "../../service/selectors/spaceSelectors";
import {emojisInput} from "../../utils";
import EmojisModal from "../modal/EmojisModal";
import {PostCommentInput} from "../post/PostCommentInput";

const emojiStyle = {
    "LOVE": "#FF1493",       // Bright Pink (vibrant and fun)
    "LIKE": "#FF4500",       // Orange Red (energetic and bold)
    "SMILE": "#00FF00",      // Neon Green (modern and eye-catching)
    "SLEEPY": "#FFD700",     // Gold (warm and playful)
    "LAUGH_TEAR": "#00FFFF"  // Cyan (bright and fresh)
};


function Post({post, router, currentMember, dispatch}) {

    const [active, setActive] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modal, setModal] = useState(false);

    const members = useSelector(selectSpaceMembersObj);
    const pathname = usePathname();

    const currentMemberId = currentMember?.memberId;
    const profile = currentMember?.user?.profile;

    let {caption, image, sharedOn, memberId, memberEmoji, aspectRatio, postId} = post;
    const member = useSelector(state => selectMemberById(state, memberId));
    const emojis = useSelector(state =>
        getEmojisByPostId(state, postId, currentMemberId)
    );

    const time = moment(sharedOn)?.fromNow();


    const handleNavigateToMember = () => {
        if (memberId === currentMemberId) {
            router.push("./yourpage")
        } else {
            router.push({
                pathname: "../member/[memberId]",
                params: {memberId: memberId}
            })
        }
    }

    const handleNavigateToPost = async () => {
        const segments = pathname.split('/').filter(Boolean)
        if (segments.length >= 2) {
            const basePath = segments.slice(0, 2).join('/');
            router.push({
                pathname: `/${basePath}/post/[postIds]`,
                params: {postIds: [postId]}
            });
        }
    };

    if (!member) return null;

    return (
        <View style={styles.postContainer}>

            <View style={styles.postHeadContainer}>
                <Pressable style={styles.postUserContainer} onPress={handleNavigateToMember}>
                    <Image source={{uri: member?.user?.profile}} style={styles.postUserImage} alt="Profile"/>
                    <View style={styles.postUserDetails}>
                        <Text style={styles.postUserName}>{member?.user.username}</Text>
                        <Text style={styles.name}>{member?.user.name}</Text>
                    </View>
                </Pressable>
                <View style={styles.timestampContainer}>
                    <Text style={styles.timestampText}>• {time}</Text>
                </View>
            </View>

            <View style={[styles.postImageContainer, {aspectRatio}]}>
                {memberId === currentMemberId && (
                    <Pressable onPress={() => setModalOpen(true)} style={styles.removeIcon}>
                        <Image style={{width: 26, height: 26}}
                               source={require("../../assets/images/deletee.png")}
                               resizeMode={"contain"}
                        />
                    </Pressable>
                )}

                <Pressable onPress={handleNavigateToPost}>
                    <DisplayImage image={image} aspectRatio={aspectRatio}
                                  altText="Post" style={styles.imageStyle}
                    />
                </Pressable>

                <MemberEmoji
                    postId={postId}
                    memberId={currentMemberId}
                    emojiId={memberEmoji}
                />

                {(post?.isPostResponseFetched && emojis?.length > 0) && (
                    <Pressable onPress={() => setModal(true)} style={styles.emojiContainer}>
                        {emojis?.slice(0, 5)?.map((e, index) => {
                            const member = members[e.emojiMember];
                            return (
                                <View key={index}
                                      style={[styles.emojiItem, {marginLeft: 9 * (index * 3), zIndex: -index}]}
                                >
                                    <Image source={{uri: member?.user?.profile}} altText="image"
                                           style={styles.profileImage}/>

                                    <View style={[styles.emojiIconContainer, {backgroundColor: emojiStyle[e?.emojis]}]}>
                                        <Text style={styles.emojiIcon}>{emojisInput[e?.emojis]}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </Pressable>)}

            </View>

            <View style={styles.postCaption}>
                <Text style={styles.postCaptionIcon}>:</Text>
                {caption ? (
                    <Text style={styles.postCaptionText}>
                        {caption}
                    </Text>
                ) : (
                    <Text style={styles.noPostCaptionText}>
                        Post Expression
                    </Text>
                )}
            </View>

            {modalOpen && (
                <DeletePostModal
                    onClose={() => setModalOpen(false)}
                    post={post}
                    dispatch={dispatch}
                    isVisible={modalOpen}
                />
            )}

            {modal && (
                <EmojisModal
                    emojis={emojis}
                    currentMemberId={currentMemberId}
                    members={members}
                    onClose={() => setModal(false)}
                    visible={modal && emojis.length > 0}
                    handleNavigateToMember={handleNavigateToMember}
                />
            )}
            <Pressable style={styles.commentInputContainer} onPress={() => setActive(true)}>
                {profile && (
                    <Image source={{uri: profile}} style={styles.commentProfile} />
                )}
                <Text style={styles.commentPlaceHolder}>Add Comment...</Text>
            </Pressable>

            <Modal
                visible={active}
                onRequestClose={() => setActive(false)}
                transparent={true}
            >
                    <View
                        style={{
                            alignSelf: "flex-end",
                            bottom: 0,
                            position: "absolute",
                            width: "100%",
                            backgroundColor: "red",
                        }}
                    >
                        <PostCommentInput
                            postId={postId}
                            memberId={currentMemberId}
                            dispatch={dispatch}
                            active={active}
                            setActive={setActive}
                        />
                    </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    postContainer: {
        marginBottom: rem(4.5),
    },
    postHeadContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end"
    },
    postUserContainer: {
        marginHorizontal: rem(1.7),
        flexDirection: "row",
        alignItems: "center",
        gap: rem(1.5)
    },
    postUserImage: {
        width: rem(4.6),
        height: rem(4.6),
        objectFit: "cover",
        borderRadius: 50,
    },
    postUserDetails: {
        gap: rem(0.5)
    },
    postUserName: {
        fontSize: rem(1.4),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.03),
        color: "#fff"
    },
    name: {
        fontSize: rem(1.3),
        fontFamily: "Inter_600SemiBold",
        color: "#6f6f6f",
        letterSpacing: rem(0.02)
    },
    timestampContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        right: "6%"
    },
    timestampText: {
        color: "#3c89fb",
        fontSize: rem(1.1),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.01)
    },
    postImageContainer: {
        alignSelf: "center",
        width: "98%",
        marginTop: rem(1),
        marginBottom: rem(0.5),
        borderRadius: 10,
        borderCurve: "continuous"
    },
    postCaption: {
        flexDirection: 'row',
        marginHorizontal: rem(1),
        alignItems: "baseline",
        marginBottom: 10,
        gap: 6
    },
    postCaptionIcon: {
        fontSize: rem(1.7),
        fontFamily: "Inter_800ExtraBold",
        color: "#fff"
    },
    postCaptionText: {
        fontSize: rem(1.4),
        fontFamily: "Inter_500Medium",
        color: "#fff"
    },
    noPostCaptionText: {
        fontSize: rem(1.4),
        fontFamily: "Inter_500Medium",
        color: "#fff"
    },
    imageStyle: {
        width: '100%',
        height: "auto",
        objectFit: "contain",
        borderRadius: 10,
        backgroundColor: "#121212FF"
    },
    removeIcon: {
        position: "absolute",
        left: "90%",
        top: "3%",
        shadowColor: "rgba(0, 0, 0, 0.4)",
        shadowOffset: {
            width: 3,
            height: 3
        },
        zIndex: 1000,
    },
    commentContainer: {
        position: "absolute",
        bottom: "25%",
        right: "5%"
    },
    emojiContainer: {
        position: "absolute",
        bottom: 30,
        left: 10,
        alignItems: "center",
        paddingHorizontal: rem(2),
        flexDirection: "row",
        paddingVertical: rem(0.6)
    },
    emojiItem: {
        position: "absolute",
        zIndex: 1001,
        backgroundColor: "#000",
        width: 50,
        height: 50,
        borderRadius: 50
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
        objectFit: "contain",
        borderWidth: 3,
        borderColor: "#1e1e1e"
    },
    emojiIconContainer: {
        position: "absolute",
        bottom: -2,
        right: -2,
        alignItems: "center",
        justifyContent: "center",
        width: 21,
        height: 21,
        borderRadius: 50,
    },
    emojiIcon: {
        fontSize: 13,
        alignSelf: "center"
    },
    commentInputContainer: {
        marginTop: 5,
        width: "100%",
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        paddingHorizontal: 15,
    },
    commentProfile: {
        width: 30,
        height: 30,
        borderRadius: 50
    },
    commentPlaceHolder: {
        color: "#6f6f6f",
        fontFamily: "Inter_600SemiBold",
        fontSize: 14,
    }
});

export default memo(Post);