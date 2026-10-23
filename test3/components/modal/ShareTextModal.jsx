import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    Image,
    View,
} from "react-native";
import {useFormik} from "formik";
import {rem} from "../../utils/uiUtils";
import {useSelector} from "react-redux";
import {selectSpaceMembers} from "../../service/selectors/spaceSelectors";
import {SEND_MESSAGE} from "../../service/constants/stompConstants";
import {addActionLoading} from "../../service/actions/appActions";
import {ADD_TEXT_LOADING} from "../../service/constants/appConstants";
import React, {useState} from "react";

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Easing, interpolateColor, runOnJS,
} from "react-native-reanimated";
import TextTagModal from "./TextTagModal";
import {textSchema} from "../../schemas/authSchemas";


// Todo: Text Suggestions later...
// Todo: Write channel names in one place
// Todo: Loading is important coz it sends notification. we use redux until get that message in
export const ShareTextModal = (
    {onClose, isVisible, dispatch, currentMemberId, spaceId}
) => {
    const members = useSelector(selectSpaceMembers);

    const [isAnonymous, setIsAnonymous] = useState(false);
    const buttonPosition = useSharedValue(0);
    const [tagged, setTagged] = useState([]);
    const [tagModalOpen, setTagModalOpen] = useState(false);


    // Todo: wrap with try catch block and check if websockets exists errors.
    const onSubmit = async (values, actions) => {
        const channel = "ws.addText";
        const message = {
            text: values.text,
            tagged: tagged,
            isAnonymous: isAnonymous,
            memberId: currentMemberId
        };
        dispatch(addActionLoading(spaceId, ADD_TEXT_LOADING));
        dispatch({type: SEND_MESSAGE, payload: {channel, message}});
        actions.resetForm();
        onClose();
    }

    const handleToggle = () => {
        const nextValue = buttonPosition.value === 0 ? 1 : 0;
        buttonPosition.value = withTiming(nextValue, {
            duration: 250,
            easing: Easing.out(Easing.ease),
        }, (isFinished) => {
            if (isFinished) {
                runOnJS(setIsAnonymous)(nextValue === 1);
            }
        });
    };



    const animatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(buttonPosition.value, [0, 1], [4, 28]);

        const backgroundColor = interpolateColor(
            buttonPosition.value,
            [0, 1],
            ["#fff", "#fff"] // Colors for each state
        );

        return {
            transform: [{ translateX }],
            backgroundColor: backgroundColor
        };
    });



    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting
    } = useFormik({
        initialValues: {
            text: "",
        },
        enableReinitialize: true,
        validationSchema: textSchema,
        onSubmit,
    });


    const RenderTaggedMembers = ({index, item}) => {
        const member = members.find(m => m.memberId === item)
        return (
            <View style={[styles.memberCard, {marginLeft: 10 * (index * 3)}]}>
                <Image source={{ uri: member?.user?.profile }} style={styles.profileImage} />
            </View>
        )
    }

    return (
        <Modal visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => onClose()}
        >
            <View style={styles.modalOverlay} pointerEvents="box-none">
                <View style={styles.modalContainer}>
                    <View style={{flex: 1}}>

                        <Text style={styles.inputHead}>What’s on your mind?</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="something 🤔..."
                                value={values.text}
                                onChangeText={handleChange("text")}
                                onBlur={handleBlur("text")}
                                placeholderTextColor="#6f6f6f"
                                multiline
                            />
                        </View>
                        {errors.text && touched.text && (
                            <Text style={styles.errorText}>{errors.text}</Text>
                        )}

                        <View style={styles.modeContainer}>
                            <Pressable style={styles.toggleContainer} onPress={handleToggle}>
                                <Animated.View style={[styles.toggle, animatedStyle]}>
                                    <Image
                                        source={isAnonymous ? require("../../assets/images/anonymous.png") : require("../../assets/images/visibility.png")}
                                        style={styles.toggleIcon}/>
                                </Animated.View>
                            </Pressable>
                            <Text style={styles.label}>
                                {isAnonymous ? "Anonymous" : "Visible"}
                            </Text>
                            <Text style={styles.labelInfo}>
                                {isAnonymous
                                    ? "Your text is only visible to members."
                                    : "Your profile details and text are visible to members."}
                            </Text>
                        </View>

                        <Pressable style={styles.taggedContainer} onPress={() => {
                            setTagModalOpen((prev) => {
                                return !prev;
                            })
                        }}>
                            <View style={styles.tagHead}>
                                <Image source={require("../../assets/images/profile.png")} style={styles.tagIcon}/>
                                <Text style={styles.tagText}>Tag Members</Text>
                            </View>
                            {
                                tagged.length > 0 ? (
                                    <View style={styles.taggedMembers}>
                                        {tagged?.slice(0, 6)?.map((i, index) => (
                                            <RenderTaggedMembers index={index} item={i} key={index} />
                                        ))}
                                        {tagged?.length > 6 && (
                                            <View style={styles.taggedInfo}>
                                                <Text style={styles.taggedText}>+{tagged.length-6} more.</Text>
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <Text>No Tag Members are selected</Text>
                                )
                            }
                        </Pressable>

                    </View>
                    <Pressable
                        onPress={handleSubmit}
                        style={styles.buttonContainer}
                        disabled={isSubmitting}
                    >
                        <Text style={{color: "#000"}}>Done</Text>
                    </Pressable>
                </View>
            </View>
            {tagModalOpen ? (
                <TextTagModal
                    tagged={tagged}
                    setTagged={setTagged}
                    currentMemberId={currentMemberId}
                    members={members}
                    isVisible={tagModalOpen}
                    onClose={() => setTagModalOpen(false)}
                />
            ): null}
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContainer: {
        width: '100%',
        height: "100%",
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 10,
    },
    inputHead: {
        marginTop: 20,
        fontSize: 16,
        fontFamily: "Inter_600SemiBold",
        paddingBottom: 10,
    },
    inputContainer: {
        position: "relative",
        backgroundColor: "#000",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        height: 120,
        borderRadius: 15
    },
    input: {
        width: "100%",
        paddingTop: 6,
        fontSize: 15,
        minHeight: 50,
        maxHeight: 120,
        fontFamily: "Inter_600SemiBold",
        color: "#fff",
        paddingVertical: rem(0.5),
        paddingHorizontal: rem(1.5),
        letterSpacing: rem(0.03),
    },
    buttonContainer: {
        backgroundColor: "#d9d9d9",
        marginTop: rem(3),
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: rem(1),
        marginHorizontal: "20%",
        borderRadius: 50,
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 4,
        marginTop: 20,
        marginRight: 20,
    },
    checked: {
        backgroundColor: 'green',
    },
    label: {
        fontSize: 17,
        fontFamily: "Inter_600SemiBold"
    },
    labelInfo: {
        fontSize: 14,
        fontFamily: "Inter_500Medium",
        color: "#000"
    },
    memberCard: {
        position: "absolute",
        zIndex: 1001,
        backgroundColor: "#000",
        width: 53,
        height: 53,
        borderRadius: 30
    },
    profileImage: {
        width: 53,
        height: 53,
        borderRadius: 30,
        marginBottom: 5,
        borderWidth: 2,
        borderColor: "#1e1e1e"
    },
    username: {
        fontSize: 13,
        color: "#333",
        fontFamily: "Inter_700Bold"
    },
    taggedContainer: {
        marginTop: rem(2),
        backgroundColor: "#d9d9d9",
        borderRadius: 15,
        padding: 10,
        width: "100%",
        marginBottom: rem(2)
    },
    tagIcon: {
        width: 23,
        height: 23,
        top: 0
    },
    toggleContainer: {
        backgroundColor: "#dfdfdf",
        borderColor: "#1e1e1e",
        borderWidth: 1,
        width: 60,
        height: 32,
        borderRadius: 50,
        justifyContent: "center",
    },
    toggle: {
        position: "absolute",
        width: 23,
        height: 23,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 50,
    },
    toggleIcon: {
        width: 22,
        height: 22,
        zIndex: 1001
    },
    modeContainer: {
        marginTop: 20,
        minHeight: 101,
        maxHeight: 150
    },
    taggedMembers: {
        flexDirection: "row",
        height: 53,
    },
    taggedInfo: {
        flexDirection: "column",
        width: "90%",
        alignItems: "flex-end",
        alignSelf: "center"
    },
    taggedText: {
        fontSize: 14,
        fontFamily: "Inter_600SemiBold"
    },
    tagHead: {
        flexDirection: "row",
        paddingBottom: 10,
        gap: 10,
        alignItems: "flex-end"
    },
    tagText: {
        paddingTop: 1,
        fontSize: 14,
        fontFamily: "Inter_600SemiBold"
    },
    errorText: {
        fontFamily: "Inter_600SemiBold",
        fontSize: 13,
        color: "red",
        marginVertical: 4,
        marginLeft: 3,
    },
});