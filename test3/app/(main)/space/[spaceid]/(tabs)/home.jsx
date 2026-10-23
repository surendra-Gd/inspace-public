import React, { useEffect, useState } from 'react';
import {TouchableOpacity, Text, StyleSheet, ScrollView, Image, ActivityIndicator} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {getCurrentSpace, selectSpaceMembers} from "../../../../../service/selectors/spaceSelectors";
import {POST_COUNT_ERROR} from "../../../../../service/constants/spaceConstants";
import {useRouter} from "expo-router";
import {getPostsCountAction, getSpaceMembersAction} from "../../../../../service/actions/spaceActions";
import Feed from "../../../../../components/home/Feed";
import {rem} from "../../../../../utils/uiUtils";

export default function Home() {
    const dispatch = useDispatch();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const { todayPosts, isMembersFetched, spaceId } = useSelector(getCurrentSpace);
    const { errors } = useSelector(state => state.app);

    const members = useSelector(selectSpaceMembers);

    const postsCountError = errors[spaceId]?.error === POST_COUNT_ERROR || false;

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            if(!isMembersFetched) {
                await dispatch(getSpaceMembersAction());
            }
            if (postsCountError) return;
            await dispatch(getPostsCountAction(spaceId));
        };
        fetch().finally(() => setLoading(false));
    }, [dispatch, spaceId]);

    if (members.length === 0 && loading) {
        return (
            <ActivityIndicator color={"#3c89fb"} size={25} style={{
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
                top: "45%",
                backgroundColor: "#000"
            }}/>
        )}


    return (
        <>
            <ScrollView style={styles.container}>
                {isMembersFetched && <Feed />}
            </ScrollView>


            {postsCountError ? (
                <TouchableOpacity style={styles.uploadBtn}>
                    <Image source={require("../../../../../assets/images/warning.png")} style={{width: 20, height: 20}} />
                    <Text style={styles.errorTxt}>Error</Text>
                </TouchableOpacity>
            ) : (
                !loading && todayPosts >= 0 && todayPosts <= 2 && (
                    <TouchableOpacity onPress={() => router.push('../upload')}
                        style={styles.uploadBtn}
                    >
                        <Image source={require("../../../../../assets/images/p.png")} style={{width: 30, height: 30}}/>
                    </TouchableOpacity>
                )
            )}
        </>
    );
}

const styles = StyleSheet.create({
    loadingStyle: {
        alignSelf: "center",
        top: "30%"
    },
    container: {
        flex: 1,
    },
    uploadBtn: {
        position: "absolute",
        bottom: "16%",
        right: rem(2),
        backgroundColor: "#fff",
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 50
    },
    errorTxt: {
        fontFamily: "Inter_800ExtraBold",
        fontSize: rem(1.2),
        color: "red"
    }
})