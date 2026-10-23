import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated,
    Vibration,
    Modal,
    Pressable, Dimensions
} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {SEND_MESSAGE} from "../../service/constants/stompConstants";
import {selectMemberById} from "../../service/selectors/spaceSelectors";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {runOnJS} from "react-native-reanimated";
import moment from "moment";
import * as Clipboard from 'expo-clipboard';
import Toast from "react-native-toast-message";


/*
item:  {"id": 3, "memberId": 27, "message": "Hi", "prefixes": null,
"spaceId": 3, "textId": 18, "timeStamp": "2024-12-21T10:17:56.944746", "type": "MESSAGE"}
*/

const SCREEN_WIDTH = Dimensions.get("window").width;
const TextMessageItem = ({ item, currentMemberId, setPrefix, router }) => {
    const dispatch = useDispatch();
    const vibrationTriggered = useRef(null);
    const member = useSelector(state => selectMemberById(state, item.memberId));

    const translationX = useRef(new Animated.Value(0)).current
    const translationY = useRef(new Animated.Value(0)).current
    const [longPressed, setLongPressed] = useState(false);

    const isCurrentUser = currentMemberId === item.memberId;
    const time =  moment(item.timeStamp).format('hh:mm A');


    useEffect(() => {
        if(isCurrentUser && longPressed) {
            setLongPressed(false);
        }
    }, [isCurrentUser]);

    const copyToClipboard = () => {
        Clipboard.setStringAsync(item?.message).then(() => {
            Toast.show({type: "success", text1: "Text copied to clipboard!", position: "bottom"})
        });
    };

    const handleLongPressStart = () => {
        Vibration.vibrate(100);
        if(currentMemberId !== member?.memberId) {
            copyToClipboard();
            return;
        }
        setLongPressed(true);
    };

    const tap = Gesture.LongPress()
        .minDuration(500)
        .onStart(() => {
            runOnJS(handleLongPressStart)();
        })

    const pan = Gesture.Pan()
        .activeOffsetX(0)
        .failOffsetY([-10, 10])
        .onUpdate((event) => {
            if(event.translationX < 0 || (event.translationX >= 100 && event.translationX > 0)) return;
            if (event.translationX >= 50 && !vibrationTriggered.current) {
                Vibration.vibrate(50);
                vibrationTriggered.current = true;
            }
            translationX.setValue(event.translationX);
        })
        .onEnd(() => {
            vibrationTriggered.current = false;
            if (translationX.__getValue() > 50) {
                requestAnimationFrame(() => {
                    setPrefix(item.message);
                });
            }
            Animated.spring(translationX, {
                toValue: 0,
                useNativeDriver: true,
                stiffness: 150,
                damping: 20
            }).start()
        })
        .runOnJS(true)

    const handleMessageDeletion = () => {
        const message = {
            textId: item.textId,
            memberId: item.memberId,
            messageId: item.id,
        };
        const channel = "/tm.removeTextMessage";
        dispatch({ type: SEND_MESSAGE, payload: { channel, message } });
    };


    const handleNavigation = () => {
        if (currentMemberId === member?.memberId) {
            router.push("../yourpage")
        } else {
            router.push({
                pathname: "../member/[memberId]",
                params: {memberId: member?.memberId}
            })
        }
    }

    if(!member) return null;

    return (
        <>
            <View
                style={[
                    styles.messageContainer,
                    { alignItems: isCurrentUser ? "flex-end" : "flex-start" },
                ]}
            >
                <GestureDetector gesture={Gesture.Simultaneous(pan, tap)}>
                    <Animated.View
                        style={[
                            styles.messageContent,
                            {
                                transform: [
                                    { translateX: translationX },
                                    { translateY: translationY },
                                ],
                                justifyContent: isCurrentUser ? "flex-end" : "flex-start"
                            },
                        ]}
                    >
                        {!isCurrentUser && member?.user?.profile && (
                            <TouchableOpacity onPress={handleNavigation}>
                                <Image
                                    source={{ uri: member.user.profile }}
                                    style={styles.profileImage}
                                />
                            </TouchableOpacity>
                        )}
                        <View style={[
                            styles.messageDiv,
                            {
                                alignItems: isCurrentUser ? "flex-end" : "flex-start",
                                backgroundColor: item?.prefixes ? "#fff" : null,
                                padding: item?.prefixes ? 5 : null,
                                borderRadius: item?.prefixes ? 20 : null
                            }
                            ]}
                        >
                            {item.prefixes ? <Text style={styles.prefix}>{item.prefixes}</Text> : null}
                            <View style={[styles.messageBg, {backgroundColor: (longPressed && isCurrentUser) ? "red" : "#dfdfdf"}]}>
                                <Text style={[styles.messageText, {color: (longPressed && isCurrentUser) ? "#fff" : "#000"}]}>{item.message}</Text>
                            </View>
                            <Text style={styles.timeContainer}>{time}</Text>
                        </View>
                    </Animated.View>
                </GestureDetector>
            </View>
            <Modal visible={longPressed && isCurrentUser}
                   transparent={true}
                   onRequestClose={() => setLongPressed(false)}
                   animationType="slide"
            >
                <Pressable style={styles.modalOverlay} onPress={() => setLongPressed(false)}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity onPress={handleMessageDeletion}>
                            <Image
                                source={require("../../assets/images/delete (4).png")}
                                style={{ width: 50, height: 50 }}
                            />
                            <Text style={{color: "#fff"}}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={copyToClipboard}>
                            <Image
                                source={require("../../assets/images/copying.png")}
                                style={{ width: 46, height: 46 }}
                            />
                            <Text style={{color: "#fff"}}>Copy</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        marginVertical: 20,
        paddingHorizontal: 20,
        width: "100%",
        transform: [{scaleY: -1}],
        // backgroundColor: "red"
    },
    messageContent: {
        // width: "70%",
        width: (SCREEN_WIDTH * 0.7) - 30,
        flexDirection: "row",
        alignItems: "flex-start",
        // backgroundColor: "green"
    },
    profileImage: {
        width: 30,
        height: 30,
        borderRadius: 50,
        marginRight: 8,
    },
    messageDiv: {
        flexDirection:"column",
        maxWidth: "100%",
    },
    messageBg: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 7,
    },
    messageText: {
        fontSize: 14,
        color: "#fff",
        fontFamily: "Inter_500Medium"
    },
    messageTimestamp: {
        fontSize: 12,
        color: "#888",
        marginTop: 4,
    },
    actions: {
        flexDirection: "row",
        marginTop: 4,
    },
    icon: {
        width: 20,
        height: 20,
        marginLeft: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContainer: {
        width: '100%',
        height: "20%",
        backgroundColor: '#1e1e1e',
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 70
    },
    timeContainer: {
        color: "#6f6f6f",
        fontFamily: "Inter_600SemiBold",
        fontSize: 11,
        marginTop: 3,
        zIndex: 1002,
    },
    prefix: {
        backgroundColor: "#1e1e1e",
        color: "#dfdfdf",
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 10,
        fontSize: 13,
        fontFamily: "Inter_600SemiBold"
    }
});

export default TextMessageItem;