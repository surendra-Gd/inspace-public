import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getMutualRequestAction} from "../../../service/actions/userActions";
import {rem} from "../../../utils/uiUtils";
import Requests from "../../../components/main/Requests";
import AddFriend from "../../../components/main/AddFriend";
import {getUnseenRequestCount} from "../../../service/selectors/userSelector";


export default function Explore() {
    const dispatch = useDispatch();
    const [isViewingRequests, setIsViewingRequests] = useState(false);
    const [loading, setLoading] = useState(true);
    const count = useSelector(getUnseenRequestCount);

    useEffect(() => {
        dispatch(getMutualRequestAction()).finally(
            () => setLoading(false)
        );
    }, [dispatch]);


    return (
        <FlatList
            ListHeaderComponent={
                <View style={styles.menu}>
                    <TouchableOpacity onPress={() => setIsViewingRequests(false)} style={styles.menuButton}>
                        <Text
                            style={[styles.buttonText, !isViewingRequests ? styles.activeButton : styles.inactiveButton]}>
                            Add Friends
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsViewingRequests(true)} style={styles.menuButton}>
                        <Text
                            style={[styles.buttonText, isViewingRequests ? styles.activeButton : styles.inactiveButton]}>
                            Requests
                        </Text>
                        {count > 0 && (
                            <View style={styles.unseenIcon}>
                                <Text style={styles.unseenIconText}>
                                    {count}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            }
            data={[]}
            renderItem={null}
            ListFooterComponent={
                loading ? (
                    <ActivityIndicator size="large" color="#fff" style={styles.loading}/>
                ) : (
                    isViewingRequests ? <Requests/> : <AddFriend/>
                )
            }
            showsVerticalScrollIndicator={false}
            style={styles.container}
        />
    );

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "rgba(0,0,0,1)",
        paddingTop: rem(9)
    },
    menu: {
        flexDirection: "row",
        justifyContent: 'center',
        paddingBottom: rem(1),
        gap: rem(2.5),
    },
    mainComp: {
        backgroundColor: "#000"
    },
    activeButton: {
        color: "#d9d9d9",
    },
    inactiveButton: {
        color: "#656565FF",
    },
    buttonText: {
        fontSize: rem(1.6),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.05)
    },
    loading: {
        marginTop: "60%",
        alignSelf: "center",
    },
    unseenIcon: {
        backgroundColor: "yellow",
        width: 18,
        height: 18,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4
    },
    unseenIconText: {
        borderRadius: 10,
        fontSize: 12,
        textAlign: "center",
        verticalAlign: "middle",
        fontFamily: "Inter_600SemiBold",
        color: "#000"
    },
    menuButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    }

});