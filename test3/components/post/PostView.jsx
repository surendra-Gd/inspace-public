import {useDispatch, useSelector} from "react-redux";
import React, {Fragment, useEffect, useState} from "react";
import {GET_POST_ERROR, POST_RESPONSE_ERROR} from "../../service/constants/spaceConstants";
import {getPostResponseAction, getPostAction} from "../../service/actions/postActions";
import {
    Pressable, Text, View, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList, ActivityIndicator,
} from "react-native";
import DisplayImage from "../shared/DisplayImage";
import MemberEmoji from "../home/MemberEmoji";
import DeletePostModal from "../modal/DeletePostModal";
import {rem} from "../../utils/uiUtils";
import {Stack, useRouter} from "expo-router";
import ErrorComponent from "../shared/ErrorComponent";
import moment from "moment/moment";
import {
    getEmojisByPostId, selectPostById, selectSpaceMembersObj
} from "../../service/selectors/spaceSelectors";
import {PostComments} from "./PostComments";
import {PostCommentInput} from "./PostCommentInput";
import {emojisInput} from "../../utils";
import EmojisModal from "../modal/EmojisModal";
import {selectIsErrorExists} from "../../service/selectors/appSelectors";


const {width, height} = Dimensions.get("window");
const emojiStyle = {
    "LOVE": "#FF1493",       // Bright Pink (vibrant and fun)
    "LIKE": "#FF4500",       // Orange Red (energetic and bold)
    "SMILE": "#00FF00",      // Neon Green (modern and eye-catching)
    "SLEEPY": "#FFD700",     // Gold (warm and playful)
    "LAUGH_TEAR": "#00FFFF"  // Cyan (bright and fresh)
};

function PostView({postId, prev, next, currentMemberId, spaceId}) {
    const router = useRouter();
    const dispatch = useDispatch();

    const [modal, setModal] = useState("CLOSE");
    const [prefix, setPrefix] = useState("");

    const members = useSelector(selectSpaceMembersObj);
    const post = useSelector(state => selectPostById(state, postId));

    const member = members[post?.memberId] || null;

    const emojis = useSelector(state =>
        getEmojisByPostId(state, postId, currentMemberId)
    );

    const postError = useSelector(state =>
        selectIsErrorExists(state, postId, "GET_POST_ERROR")
    );
    const responseError = useSelector(state =>
        selectIsErrorExists(state, postId, "POST_RESPONSE_ERROR")
    );


    const time = moment(post?.sharedOn)?.format('hh:mm A');
    const [loading, setLoading] = useState(true);

    // Fetch the post
    useEffect(() => {
        const fetchPost = async () => {
            if (postError || post) return;
            setLoading(true);
            try {
                await dispatch(getPostAction(postId));
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId, post, postError, dispatch]);

    // Fetch post responses (emojis, comments) after post is fetched
    useEffect(() => {
        const fetchPostResponse = async () => {
            if (responseError || !post || post?.isPostResponseFetched) return;
            setLoading(true);
            try {
                await dispatch(getPostResponseAction(postId));
            } finally {
                setLoading(false);
            }
        };
        fetchPostResponse();
    }, [postId, post, responseError, dispatch]);

    const handleNavigateToMemberPage = (memberId) => {
        try {
            if (currentMemberId === memberId) {
                router.push("../yourpage")
            } else {
                router.push({
                    pathname: "../member/[memberId]",
                    params: {memberId: memberId}
                })
            }
        } finally {
            setModal("CLOSE");
        }
    }

    if (loading && !post) {
        return (
            <Text style={styles.postLoading}>
                {"Just a sec... the page is almost \nready! 🚀🔄"}
            </Text>
        )
    }

    if (postError || (!post && !loading)) {
        return (
            <View style={styles.errorContainer}>
                <ErrorComponent msg={"Something went wrong while fetching the posts."}/>
            </View>
        );
    }

    if (!member || Object.keys(member).length === 0) {
        return null;
    }

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace({
                pathname: "/space/[spaceid]/home",
                params: {spaceid: spaceId}
            })
        }
    }

    const pageHeader = () => (
        <View style={styles.header}>
            <View style={styles.backContainer}>
                <TouchableOpacity onPress={handleBack}>
                    <Image source={require("../../assets/images/back (1).png")} style={{width: 20, height: 20}}/>
                </TouchableOpacity>
                <View style={styles.subHeader}>
                    <Pressable onPress={() => handleNavigateToMemberPage(member?.memberId)}
                               style={styles.userContainer}>
                        <Image source={{uri: member?.user?.profile}} altText={member?.user?.username}
                               style={styles.userImage}/>
                        <View style={styles.userDetails}>
                            <Text style={styles.username}>{member?.user?.username}</Text>
                            <Text style={styles.name}>{member?.user?.name}</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
            {member?.memberId === currentMemberId && (
                <Pressable onPress={() => setModal("DELETE")} style={styles.removeIcon}>
                    <Image source={require("../../assets/images/deletee.png")} style={{width: 26, height: 26}}
                           resizeMode={"contain"}/>
                </Pressable>)}
        </View>
    );

    return (
        <View style={{flex: 1}}>
            <Stack.Screen options={{header: () => pageHeader()}}/>

            <FlatList
                data={[]}
                renderItem={() => {
                }}
                ListHeaderComponent={post && (
                    <>
                        <View style={[styles.imageContainer, {aspectRatio: post.aspectRatio}]}>
                            <Text style={styles.timeDiv}>• {time}</Text>

                            <DisplayImage image={post?.image} altText="image" aspectRatio={post.aspectRatio}/>

                            {prev && (
                                <TouchableOpacity onPress={() => prev()} style={[styles.sliderIcon, {left: "2%"}]}>
                                    <Image source={require("../../assets/images/left.png")}
                                           style={{width: 12, height: 12}}/>
                                </TouchableOpacity>)}

                            {next && (
                                <TouchableOpacity onPress={() => next()} style={[styles.sliderIcon, {right: "2%"}]}>
                                    <Image source={require("../../assets/images/right.png")}
                                           style={{width: 12, height: 12}}/>
                                </TouchableOpacity>)}

                            {(loading && !post?.isPostResponseFetched) ? (
                                <View style={styles.emojisLoading}>
                                    <ActivityIndicator size={22} color={"#fff"}/>
                                </View>
                            ) : responseError ? (
                                <View style={styles.errorIcon}>
                                    <Image source={require("../../assets/images/warning.png")}
                                           style={{width: 20, height: 20}}/>
                                    <Text style={styles.errorTxt}>Emojis Failed</Text>
                                </View>
                            ) : (
                                post?.isPostResponseFetched && emojis?.length > 0) && (
                                <>
                                    <MemberEmoji postId={postId} memberId={currentMemberId}/>
                                    <Pressable onPress={() => setModal("EMOJIS")} style={styles.emojiContainer}>
                                        {emojis?.slice(0, 5)?.map((e, index) => {
                                            const member = members[e.emojiMember];
                                            return (
                                                <View key={index}
                                                      style={[styles.emojiItem, {
                                                          marginLeft: 9 * (index * 3),
                                                          zIndex: -index
                                                      }]}
                                                >
                                                    <Image source={{uri: member?.user?.profile}} altText="image"
                                                           style={styles.profileImage}/>

                                                    <View
                                                        style={[styles.emojiIconContainer, {backgroundColor: emojiStyle[e?.emojis]}]}>
                                                        <Text style={styles.emojiIcon}>{emojisInput[e?.emojis]}</Text>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </Pressable>
                                </>
                            )}

                        </View>
                        <Text style={styles.captionTxt}>
                            : {post.caption ? post.caption : "Photo Expression"}
                        </Text>
                    </>
                )}
                ListFooterComponent={(loading && !post?.isPostResponseFetched) ? (
                    <Text style={styles.commentsLoading}>
                        Comments are loading... hold up! 💬⏳
                    </Text>
                ) : responseError ? (
                    <Text style={styles.commentsError}>
                        {"Oops! 🚨 Comments didn’t load. \nTry again later!"}
                    </Text>
                ) : (
                    post?.isPostResponseFetched && (
                        <PostComments post={post} currentMemberId={currentMemberId} members={members}/>
                    )
                )}
            />

            <PostCommentInput
                prefix={prefix}
                setPrefix={setPrefix}
                postId={postId}
                memberId={currentMemberId}
                dispatch={dispatch}
            />

            {modal === "DELETE" && (
                <DeletePostModal
                    isVisible={modal === "DELETE"}
                    post={post} router={router}
                    dispatch={dispatch}
                    onClose={() => setModal("CLOSE")}
                />
            )}


            {modal === "EMOJIS" && (
                <EmojisModal
                    emojis={emojis}
                    currentMemberId={currentMemberId}
                    members={members}
                    onClose={() => setModal("CLOSE")}
                    visible={modal === "EMOJIS" && emojis.length > 0}
                    handleNavigateToMember={handleNavigateToMemberPage}
                />
            )}

        </View>
    )
}

export default PostView;

const styles = StyleSheet.create({
    timeDiv: {
        position: "absolute",
        top: rem(1.5),
        right: 20,
        color: "#fff",
        backgroundColor: "#000",
        borderRadius: 6,
        paddingVertical: 3,
        paddingHorizontal: 8,
        fontSize: rem(1),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.01),
        zIndex: 1000
    }, imageContainer: {
        position: "relative",
        width: "96%",
        alignSelf: "center",
        backgroundColor: "#121212FF",
        borderRadius: 10,
        overflow: "hidden"
    }, removeIcon: {
        // position: "absolute",
        // left: "90%",
        // top: "3%",
        // shadowColor: "rgba(0, 0, 0, 0.4)",
        // shadowOffset: {
        //     width: 3,
        //     height: 3
        // },
        // zIndex: 1000,
    }, sliderIcon: {
        position: "absolute",
        top: "50%",
        alignSelf: "center",
        flexDirection: "column",
        gap: 100,
        backgroundColor: "#000",
        borderRadius: 25,
        width: 24,
        aspectRatio: "1/1",
        alignItems: "center",
        justifyContent: "center"
    }, captionTxt: {
        fontSize: rem(1.4),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.03),
        color: "#fff",
        paddingVertical: rem(1),
        paddingHorizontal: rem(1)
    },


    userContainer: {
        marginTop: rem(0.5),
        marginVertical: rem(1),
        marginHorizontal: rem(1.7),
        gap: rem(1),
        flexDirection: "row",
        alignItems: "center"
    }, userImage: {
        width: rem(4.2), height: rem(4.2), borderRadius: 50,
    }, userDetails: {
        gap: rem(0.1)
    }, username: {
        fontSize: rem(1.4), fontWeight: "Inter_500Medium", letterSpacing: rem(0.03), color: "#fff"
    }, name: {
        fontSize: rem(1.3),
        textAlign: "left",
        fontFamily: "Inter_600SemiBold",
        color: "#6F6F6FFF",
        letterSpacing: rem(0.02)
    }, header: {
        top: 5, width: '100%', height: 90, alignSelf: "flex-end", gap: 10, // backgroundColor: '#000',
        paddingHorizontal: 20, paddingTop: 25, // zIndex: 100,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between"
    }, header2: {
        position: "absolute", zIndex: 1002, width: "100%", // height: height / 2,
        backgroundColor: "#fff", // justifyContent: "center"
        // borderRadius: 20,
        // borderWidth: 6,
        // borderColor: "#1e1e1e"
    }, backContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        // gap: 1
    }, subHeader: {
        flexDirection: "row",
        // gap: 10,
        justifyContent: "center",
        alignItems: "center"
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
    }, image: {
        position: "absolute",
        zIndex: 1001,
        width: "100%",
        height: height / 2,
        backgroundColor: "red",
        borderColor: "#1e1e1e",
        borderWidth: 3,
        borderRadius: 10,
    },
    errorContainer: {
        top: "30%",
    },
    errorIcon: {
        position: "absolute",
        left: 20,
        bottom: 20,
        flexDirection: "row",
        alignItems: 'center',
        gap: 4,
        justifyContent: 'center',
        zIndex: 1001
    },
    errorTxt: {
        fontFamily: "Inter_600SemiBold",
        fontSize: 14,
        color: "red"
    },
    commentsError: {
        fontSize: 14,
        color: "rgba(255,0,0,0.91)",
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: 10,
        textAlign: "center",
        marginTop: 30
    },
    postLoading: {
        top: "30%",
        alignSelf: "center",
        color: "#fff",
        fontFamily: "Inter_600SemiBold",
        fontSize: 15,
        paddingHorizontal: 30,
        textAlign: "center"
    },
    emojisLoading: {
        position: "absolute",
        left: 20,
        bottom: 20,
        flexDirection: "row",
        alignItems: 'center',
        gap: 4,
        justifyContent: 'center',
        zIndex: 1001,
    },
    commentsLoading: {
        fontSize: 14,
        color: "#6f6f6f",
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: 10,
        textAlign: "center",
        marginTop: 30
    }
})