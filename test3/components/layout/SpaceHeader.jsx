import React, {useState} from 'react';
import {View, TouchableOpacity, Text, Modal, StyleSheet, Image} from 'react-native';
import {useLocalSearchParams, useRouter} from "expo-router";
import {rem} from "../../utils/uiUtils";
import {clearCurrentSpaceIdAction} from "../../service/actions/spaceActions";
import {useDispatch} from "react-redux";


export default function SpaceHeader() {
    const router = useRouter();
    const dispatch = useDispatch();
    const {spaceid} = useLocalSearchParams();
    const [isDropdownActive, setDropdownActive] = useState(false);


    const handleButton = async () => {
        try {
            await dispatch(clearCurrentSpaceIdAction());
        } finally {
            router.replace("/spaces");
        }
    };


    const handleNavigate = (pathname) => {
        setDropdownActive(false);
        router.push({
            pathname: `/space/[spaceid]/${pathname}`,
            params: {spaceid: spaceid}
        });
    };


    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleButton} style={styles.menuButton}>
                <Image source={require("../../assets/images/back.png")} alt="left-arrow"
                       style={{width: 26, height: 26}}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setDropdownActive(true)} style={styles.menuButton}>
                <Image source={require("../../assets/images/menu (2).png")} alt="menu-icon"
                       style={{width: 24, height: 24}}/>
            </TouchableOpacity>

            <Modal visible={isDropdownActive} transparent={true} animationType="fade"
                   onRequestClose={() => setDropdownActive(false)}>
                <View style={styles.modal}>
                    <View style={styles.dropdownContainer}>

                        <TouchableOpacity onPress={() => handleNavigate("activity")}
                                          style={[styles.dropdownItem,
                                              {
                                                  borderTopStartRadius: 15,
                                                  borderTopEndRadius: 15,
                                              }]}>
                            <Text style={styles.itemText}>Activity ⚡</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleNavigate("members")}
                                          style={styles.dropdownItem}
                        >
                            <Text style={styles.itemText}>Members 👥</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleNavigate("leave")}
                                          style={[styles.dropdownItem]}
                        >
                            <Text style={styles.itemText}>Leave 👋</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setDropdownActive(false)}
                                          style={{
                                              padding: 10,
                                              alignItems: 'center',
                                              borderBottomStartRadius: 15,
                                              borderBottomEndRadius: 15,
                                          }}
                        >
                            <Text style={styles.closeText}>Close ❌</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        position: "absolute",
        backgroundColor: "transparent",
        padding: rem(0.2),
        alignSelf: "center",
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
    },
    menuButton: {
        backgroundColor: "rgba(0,0,0,1)",
        top: 40,
        width: 40,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    modal: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    dropdownContainer: {
        position: "absolute",
        width: "80%",
        top: rem(20),
        borderCurve: "continuous",
        gap: rem(0.3),
        borderRadius: 20,
        backgroundColor: "#1e1e1e",
    },
    dropdownItem: {
        padding: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: "#6f6f6f"
    },
    itemText: {
        fontSize: 17,
        fontFamily: "Inter_600SemiBold",
        color: '#fff',
    },
    closeButton: {
        padding: 10,
        alignItems: 'center',
    },
    closeText: {
        color: '#ff0000',
        fontSize: rem(1.7),
        fontFamily: "Inter_700Bold",
    },
});

/*

Toast.show({
    type: "status", // Matches the registered custom type
    text1: "iamsurendra", // Default Toast prop
    props: {
        isOnline: false,
        profileUri: user?.profile,
        key: key.toString()
    },
    autoHide: false, // Optional
    onPress: () => {
        router.back();
        Toast.hide();
    },
});

setKey(key+1);*/


/*Toast.show({
    type: "message",
    text2: "Just Testing message!",
    autoHide: true,
    onPress: () => {
        router.back();
        Toast.hide();
    },
})*/

/*
Toast.show({
    type: "streak",
    text1: "iamsurendra",
    props: {
        streakCount: 10,
        profileUri: user?.profile,
    },
    autoHide: false,
});*/
