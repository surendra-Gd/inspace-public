import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useLocalSearchParams, useRouter} from "expo-router";
import {
    getCurrentSpace,
    getSortedTextMessages,
    getTextById,
    selectMemberById,
} from "../../../../../service/selectors/spaceSelectors";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Keyboard, Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {TextMessageInput} from "../../../../../components/shared/TextMessageInput";
import {getTextAction, getTextMessagesAction} from "../../../../../service/actions/textActions";
import {rem} from "../../../../../utils/uiUtils";
import DeleteTextModal from "../../../../../components/modal/DeleteTextModal";
import TextMessageItem from "../../../../../components/text/TextMessageItem";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import LikeButton from "../../../../../components/shared/LikeButton";
import {getSpaceMembersAction} from "../../../../../service/actions/spaceActions";
import {GET_TEXT_ERROR} from "../../../../../service/constants/spaceConstants";
import {selectIsErrorExists, selectUnseenMessageCountByTextId} from "../../../../../service/selectors/appSelectors";
import {REMOVE_UNSEEN_ITEM} from "../../../../../service/constants/appConstants";
import moment from "moment/moment";
import ShowTagModal from "../../../../../components/modal/ShowTagModal";


const RenderTextMessage = React.memo(({item, currentMemberId, setPrefix, router}) => {
    return (
        <TextMessageItem
            item={item}
            currentMemberId={currentMemberId}
            setPrefix={setPrefix}
            router={router}
        />
    );
});

const RenderMonthDate = React.memo(({date}) => {
    return (
        <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{date}</Text>
        </View>
    );
});


const SCREEN_WIDTH = Dimensions.get("window").width;

export default function TextView() {
    const dispatch = useDispatch();
    const router = useRouter();

    const [tag, setTag] = useState(false);
    const {textId} = useLocalSearchParams();
    const [prefix, setPrefix] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUserMessageSent, setUserMessageSent] = useState(false);

    const [expand, setExpand] = useState(false);
    const [keyBoardActive, setKeyboardActive] = useState(false);

    const recyclerListViewRef = useRef(null);
    const scrollY = useRef(new Animated.Value(0)).current;

    const spaceText = useSelector((state) => getTextById(state, textId));
    const {text, createdOn, anonymous, likesCount, liked, memberId, page, messagesCount, tagged} = spaceText || {};
    const {currentMember, isMembersFetched, spaceId} = useSelector(getCurrentSpace);
    const currentMemberId = currentMember?.memberId;
    const member = useSelector((state) => selectMemberById(state, memberId));
    const textMessages = useSelector((state) => getSortedTextMessages(state, Number(textId)));
    const badges = useSelector(state =>
        selectUnseenMessageCountByTextId(state, textId)
    );

    const [groupMessages, setGroupMessages] = useState([]);
    const [dataProvider, setDataProvider] = useState(
        new DataProvider((r1, r2) => r1.id !== r2.id).cloneWithRows([])
    );

    const [isPageDataLoading, setIsPageLoading] = useState(false);
    const textError = useSelector(state =>
        selectIsErrorExists(state, textId, "GET_TEXT_ERROR")
    );

    const textMessageError = useSelector(state =>
        selectIsErrorExists(state, textId, "GET_TEXT_MESSAGE_ERROR")
    );

    const time = moment(createdOn).format('MMM D, YYYY h:mm A');

    const handleNavigation = () => {
        if (currentMemberId === memberId) {
            router.push("../yourpage")
        } else {
            router.push({
                pathname: "../member/[memberId]",
                params: {memberId}
            })
        }
    }

    useEffect(() => {
        const initializePage = () => {
            try {
                if ((isMembersFetched && spaceText) || textError) return;
                setIsPageLoading(true);
                if (!isMembersFetched) {
                    dispatch(getSpaceMembersAction());
                }
                if (!spaceText) {
                    dispatch(getTextAction(textId));
                }
            } finally {
                setIsPageLoading(false);
            }
        }
        initializePage();
    }, [textId]);

    const layoutProvider = useMemo(
        () =>
            new LayoutProvider(
                (index) => (groupMessages[index]?.type === "date" ? "DATE" : "USER"),
                (type, dim, index) => {
                    dim.width = SCREEN_WIDTH;
                    if (type === "USER") {
                        dim.height = 100;
                    } else {
                        dim.height = 150;
                    }
                }
            ),
        [groupMessages]
    );

    // Fetch Messages with Pagination
    const fetchTextMessages = useCallback(async () => {
        if (textMessageError) return;
        if (!page || (page?.hasNext && !loading)) {
            setLoading(true);
            try {
                const fetchPage = page ? page.currentPage + 1 : 0;
                await dispatch(getTextMessagesAction(fetchPage, textId));
            } catch (err) {
                console.error("Error fetching message:", err);
            } finally {
                setLoading(false);
            }
        }
    }, [page, loading, dispatch, textId]);


    // Group Messages by Date
    useEffect(() => {
        const grouped = [];
        let lastDate = "";
        textMessages.forEach((msg) => {
            const messageDate = new Date(msg.timeStamp).toDateString();
            if (messageDate !== lastDate) {
                grouped.push({id: messageDate, type: "date", date: messageDate});
                lastDate = messageDate;
            }
            grouped.push({...msg, type: "message"});
        });
        setGroupMessages(grouped.reverse());
    }, [textMessages]);

    // Update Data Provider when Group Messages Change
    useEffect(() => {
        setDataProvider(new DataProvider((r1, r2) => r1.id !== r2.id).cloneWithRows(groupMessages));
    }, [groupMessages]);


    useEffect(() => {
        if (recyclerListViewRef.current && isUserMessageSent) {
            Animated.timing(scrollY, {
                toValue: 0,
                duration: 100,
                useNativeDriver: false,
            }).start(() => {
                recyclerListViewRef.current?.scrollToOffset(0, 0, true);
                setUserMessageSent(false);
            });
        }
    }, [groupMessages]);


    useEffect(() => {
        if (badges > 0) {
            dispatch({
                type: REMOVE_UNSEEN_ITEM,
                payload: {spaceId, itemId: textId, itemType: "unseenTextMessages"}
            });
        }
    }, [badges, textId]);

    // Render Message Items
    const renderMessageItem = useCallback(
        (type, data) => {
            if (data.type === "date") {
                return <RenderMonthDate date={data.date}/>
            }
            return (
                <RenderTextMessage
                    item={data}
                    currentMemberId={currentMemberId}
                    setPrefix={setPrefix}
                    router={router}
                />
            );
        },
        [currentMemberId]
    );

    // Interpolations
    const translateY = scrollY.interpolate({
        inputRange: [0, 100], // Adjust based on when you want the effect to complete
        outputRange: [0, -200], // Moves to the left
        extrapolate: "clamp",
    });

    const opacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0], // Fades out as you scroll up
        extrapolate: "clamp",
    });

    const handleRecyclerScroll = (event) => {
        const scrollYValue = event.nativeEvent.contentOffset.y;
        scrollY.setValue(scrollYValue);
    };


    useEffect(() => {
        const keyboardDidShowListener = Keyboard
            .addListener('keyboardDidShow', () => {
                if (!keyBoardActive && groupMessages?.length > 0) {
                    setKeyboardActive(true);
                }
            });

        const keyboardDidHideListener = Keyboard
            .addListener('keyboardDidHide', () => {
                if (keyBoardActive && groupMessages?.length > 0) {
                    setKeyboardActive(false);
                }
            });

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, [keyBoardActive, groupMessages]);

    useEffect(() => {
        if (!spaceText) return;
        fetchTextMessages().finally(() => setLoading(false));
    }, [spaceText]);

    const handleUserTextAction = () => {
        setUserMessageSent(true);
        if (prefix) {
            setPrefix("");
        }
    };

    const renderFooter = () => {
        if (!loading || !page?.hasNext) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator color={"#dfdfdf"} size={22}/>
            </View>
        );
    };

    if (!textError && isPageDataLoading) {
        return (
            <View style={{alignSelf: "center", top: "50%"}}>
                <ActivityIndicator size={22} color={"#dfdfdf"} />
            </View>
        );
    }


    if (textError || (!spaceText && !isPageDataLoading)) {
        return (
            <Text style={styles.textError}>
                {"Uh - oh! 💥 Couldn’t fetch this text. \nTry again!"}
            </Text>
        )
    }

    if (!member) return null;


    return (
        <View style={styles.container}>
            <Animated.View style={[
                styles.header,
                {
                    transform: [{translateY}],
                    opacity,
                    display: keyBoardActive ? "none" : "flex"
                },
            ]}>
                {!anonymous && (
                    <Pressable onPress={handleNavigation} style={styles.postUserContainer}>
                        <Image source={{uri: member?.user?.profile}} style={styles.postUserImage} alt="Profile"/>
                        <View style={styles.postUserDetails}>
                            <Text style={styles.postUserName}>{member?.user.username}</Text>
                            <Text style={styles.name}>{member?.user.name}</Text>
                        </View>
                    </Pressable>
                )}

                <View style={styles.textContainer}>
                    <Text style={styles.text} numberOfLines={expand ? 0 : 4}
                          onPress={() => setExpand(!expand)}>{text}</Text>
                    <Text style={styles.timestamp}>{time}</Text>
                    {tagged.length > 0 && (
                        <Pressable onPress={() => setTag(true)} style={styles.userTag}>
                            <Image source={require("../../../../../assets/images/user-tag.png")}
                                   style={{width: 30, height: 30}}/>
                        </Pressable>
                    )}
                </View>

                <View style={styles.meta}>
                    {currentMemberId === memberId && (
                        <TouchableOpacity onPress={() => setModalOpen(true)}>
                            <Image source={require("../../../../../assets/images/delete (3).png")}
                                   style={{width: 25, height: 25}}/>
                        </TouchableOpacity>
                    )}
                    <View style={styles.commentContainer}>
                        <Image source={require("../../../../../assets/images/comment.png")}
                               style={{width: 25, height: 25}}/>
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
            </Animated.View>
            {(!loading && !page) ? (
                <View style={styles.messageLoadContainer}>
                    <Text style={styles.messageLoadText}>
                        Loading your messages... 💬
                    </Text>
                </View>
            ) : textMessageError ? (
                <Text style={styles.messagesError}>
                    {"Yikes! 💬 Couldn’t load the messages. \nTry again later!"}
                </Text>
            ) : (groupMessages?.length > 0 ? (
                    <RecyclerListView
                        ref={recyclerListViewRef}
                        dataProvider={dataProvider}
                        layoutProvider={layoutProvider}
                        rowRenderer={renderMessageItem}
                        onEndReached={fetchTextMessages}
                        onEndReachedThreshold={0.5}
                        style={styles.chatContainer}
                        renderFooter={renderFooter}
                        scrollEventThrottle={16}
                        onScroll={handleRecyclerScroll}
                        forceNonDeterministicRendering={true}
                    />
                ) : (
                    <View style={styles.emptyChatContainer}>
                        <Text style={styles.emptyChatPlaceholder}>No Messages Yet 🚫💬</Text>
                    </View>
                )
            )}

            {(!textMessageError)&& (<TextMessageInput
                prefix={prefix}
                textId={textId}
                memberId={currentMemberId}
                dispatch={dispatch}
                handleUserTextAction={handleUserTextAction}
                keyBoardIsActive={keyBoardActive}
                setPrefix={setPrefix}
            />)}

            {modalOpen && (
                <DeleteTextModal
                    textId={textId}
                    memberId={currentMemberId}
                    dispatch={dispatch}
                    onClose={() => setModalOpen(false)}
                    isVisible={modalOpen}
                    router={router}
                />
            )}

            {tag && (
                <ShowTagModal
                    tagged={tagged}
                    isVisible={tag}
                    onClose={() => setTag(false)}
                />
            )}

        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: rem(7),
        position: "relative"
    },
    header: {
        position: "absolute",
        zIndex: 1001,
        width: "100%",
        backgroundColor: "#000"
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
        // paddingBottom: rem(1),
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
    chatContainer: {
        flex: 1,
        transform: [{scaleY: -1}]
    },
    dateContainer: {
        marginVertical: 20,
        alignItems: "center",
        alignSelf: "center",
        flex: 1,
        transform: [{scaleY: -1}]
    },
    dateText: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: "#1e1e1e",
        fontSize: 11,
        fontFamily: "Inter_600SemiBold",
        color: "#d9d9d9",
    },
    emptyChatContainer: {
        top: "50%",
        flex: 1,
        alignItems: "center",
    },
    emptyChatPlaceholder: {
        fontSize: 15,
        fontFamily: "Inter_600SemiBold",
        color: "#dfdfdf",
    },
    footer: {
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 10,
        transform: [{scaleY: -1}]
    },
    textError: {
        fontSize: 14,
        color: "rgba(255,0,0,0.91)",
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: 10,
        textAlign: "center",
        marginTop: "50%"
    },
    messagesError: {
        fontSize: 14,
        color: "rgba(255,204,0,0.93)",
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: 10,
        textAlign: "center",
        marginTop: "100%"
    },
    userTag: {
        position: "absolute",
        right: 20,
        top: 0
    },
    messageLoadContainer: {
        flex: 1,
        marginTop: "90%",
        alignSelf: "center",
        paddingHorizontal: 10
    },
    messageLoadText: {
        color: "#fff",
        fontSize: 15,
        fontFamily: "Inter_600SemiBold"
    }
});