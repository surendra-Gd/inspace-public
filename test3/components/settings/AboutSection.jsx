import React from "react";
import {View, Text, Alert, Share, StyleSheet, Linking, Pressable, Image} from "react-native";
import {rem} from "../../utils/uiUtils";
import Toast from "react-native-toast-message";

export default function AboutSection() {
    const shareContent = async () => {
        const link = 'https://theinspace.net/';

        const shareData = {
            title: 'InSpace',
            message: `Check out InSpace! A private space social media platform for connecting with your close relations. Join now and start sharing personal moments securely. Get it here: ${link}`,
        };

        try {
            await Share.share(shareData);
        } catch (error) {
            Toast.show({type: 'error', text1: 'Sharing failed.'});
        }
    };

    const mailToLink = () => {
        Linking.openURL('mailto:contact@theinspace.net')
            .catch(err => Alert.alert("Error", "Failed to open email client."));
    };

    const openURL = (url) => {
        Linking.openURL(url).catch(err =>  Alert.alert("Error", "Failed to open privacy policies."));
    };

    return (
        <View style={{marginTop: rem(1.4)}}>
            <Pressable style={styles.settingItem} onPress={mailToLink}>
                <Image source={require("../../assets/images/chatting.png")} style={{width: 23, height: 23}} />
                <Text style={styles.settingItemName}>Contact Us</Text>
            </Pressable>
            <Pressable style={styles.settingItem} onPress={shareContent}>
                <Image source={require("../../assets/images/share (1).png")} style={{width: 21, height: 21}}/>
                <Text style={styles.settingItemName}>Share InSpace</Text>
            </Pressable>
            {/*<Pressable style={styles.settingItem} onPress={() => {}}>*/}
            {/*    <Image source={require("../../assets/images/page.png")} style={{width: 21, height: 21, left: rem(0.5)}}/>*/}
            {/*    <Text style={styles.settingItemName}>Terms & Conditions</Text>*/}
            {/*</Pressable>*/}
            <Pressable style={styles.settingItem} onPress={() => openURL("https://theinspace.net/privacy-policy.html")}>
                <Image source={require("../../assets/images/shield.png")} style={styles.settingIcon}/>
                <Text style={styles.settingItemName}>Privacy Policy</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    settingItem: {
        padding: rem(1.3),
        backgroundColor: "rgba(21, 21, 21, 1)",
        borderRadius: 10,
        marginBottom: rem(2),
        flexDirection: "row",
        paddingLeft: rem(2),
        gap: rem(1.5)
    },
    settingItemName: {
        color: "#d9d9d9",
        fontFamily: "Inter_600SemiBold",
        fontSize: rem(1.4),
        letterSpacing: rem(0.03)
    },
    settingIcon: {
        width: 25,
        height: 25
    },
});