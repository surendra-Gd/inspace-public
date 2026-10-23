import {View, StyleSheet, Text, Image} from "react-native";
import UserStatusToast from "../components/toast/UserStatusToast";
import TextMessageToast from "../components/toast/TextMessageToast";
import StreakToast from "../components/toast/StreakToast";
import PostCommentToast from "../components/toast/PostCommentToast";
import ReplyCommentToast from "../components/toast/ReplyCommentToast";

export const toastConfig = {

    success: ({text1}) => (
        <View style={styles.successToastContainer}>
            <Image source={require("../assets/images/tick-mark.png")} style={{width: 25, height: 25}}/>
            <Text style={styles.successToastText}>{text1}</Text>
        </View>
    ),

    error: ({text1}) => (
        <View style={styles.errorToastContainer}>
            <Image source={require("../assets/images/warning.png")} style={{width: 20, height: 20}}/>
            <Text style={styles.errorToastText}>{text1}</Text>
        </View>
    ),

    streak: ({props}) => (
        <StreakToast props={props}/>
    ),

    status: ({text1, props}) => {
        const {profile, isOnline, key} = props || {};
        return (
            <UserStatusToast
                text1={text1}
                profile={profile}
                isOnline={isOnline}
                id={key}
            />
        )
    },

    message: ({text2, props}) => {
        const {onClick, profile, text} = props || {}
        return (
            <TextMessageToast
                text2={text2}
                onClick={onClick}
                profile={profile}
                text={text}
            />
        );
    },


    comment: ({props}) => (
        <PostCommentToast props={props}/>
    ),

    reply: ({props}) => (
        <ReplyCommentToast props={props} />
    )

}

const styles = StyleSheet.create({
    successToastContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 10,
        backgroundColor: "#000",
        borderWidth: 1,
        borderColor: "#1e1e1e",
        width: "97%",
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 10,
        zIndex: 1000,
        alignSelf: "center"
    },
    successToastText: {
        color: "#38ae38",
        fontSize: 13,
        fontFamily: "Inter_600SemiBold",
        zIndex: 1000
    },
    errorToastContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 10,
        backgroundColor: "#000",
        borderWidth: 1,
        borderColor: "#1e1e1e",
        width: "97%",
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 10,
        zIndex: 1000,
        alignSelf: "center",
        paddingRight: 20
    },
    errorToastText: {
        color: '#FF0000',
        fontSize: 13,
        fontFamily: "Inter_600SemiBold",
        zIndex: 1000
    }
})