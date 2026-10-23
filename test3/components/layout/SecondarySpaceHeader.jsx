import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {useLocalSearchParams, useRouter} from "expo-router";
import {setCurrentSpaceIdAction} from "../../service/actions/spaceActions";

function SecondarySpaceHeader({title}) {
    const router = useRouter();
    const {spaceid} = useLocalSearchParams();

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace({
                pathname: "/space/[spaceid]/home",
                params: {spaceid: spaceid}
            })
        }
    }

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => handleBack()} style={styles.backButton}>
                <Image source={require("../../assets/images/back (1).png")} style={{width: 20, height: 20}}/>
                {title && (
                    <Text style={styles.title}>{title}</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: "flex-end",
        gap: 15,
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingTop: 25,
        zIndex: 1000,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    title: {
        fontFamily: "Inter_600SemiBold",
        fontSize: 16,
        letterSpacing: 1.3,
        color: "#fff"
    },
});

export default SecondarySpaceHeader;