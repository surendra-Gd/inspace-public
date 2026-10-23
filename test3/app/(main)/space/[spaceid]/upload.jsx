import React, { useEffect, useState } from "react";
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {getCurrentSpace} from "../../../../service/selectors/spaceSelectors";
import {POST_COUNT_ERROR} from "../../../../service/constants/spaceConstants";
import {getPostsCountAction} from "../../../../service/actions/spaceActions";
import {useRouter} from "expo-router";
import {SelectImage} from "../../../../components/upload/SelectImage";
import {rem} from "../../../../utils/uiUtils";

export default function InSpaceUploadPage() {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const { spaceId, todayPosts } = useSelector(getCurrentSpace);
    const { errors } = useSelector((state) => state.app);
    const postsCountError = errors[spaceId]?.error === POST_COUNT_ERROR || false;

    useEffect(() => {
        if (postsCountError) return;
        setLoading(true);
        dispatch(getPostsCountAction(spaceId)).finally(() => {
            setLoading(false);
        });
    }, [dispatch, spaceId]);


    if (loading) return <ActivityIndicator size={"large"} color={"#fff"} />;

    return (
        <View style={styles.container}>

            {(todayPosts >= 0 && todayPosts <= 2) ? (
                <SelectImage count={todayPosts} />
            ) : (
                <View style={styles.postLimitContainer}>
                    <Text style={styles.postLimitHeading}>Daily Post Limit Reached</Text>
                    <Text style={styles.postLimitMessage}>
                        You can share a maximum of <Text style={styles.boldText}>3 posts</Text> per day within this space.
                        Unfortunately, you have reached your limit for today.
                    </Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.link}>
                        <Text style={styles.linkText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    backButton: {
        alignSelf: "flex-start",
        marginBottom: 16,
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    errorMessage: {
        textAlign: "center",
        color: "red",
        fontSize: 16,
    },
    postLimitContainer: {
        marginTop: rem(10),
        alignItems: "center",
    },
    postLimitHeading: {
        fontSize: rem(2),
        fontFamily: "Inter_700Bold",
        color: "red",
        marginBottom: 10,
    },
    postLimitMessage: {
        fontSize: rem(1.5),
        textAlign: "center",
        paddingHorizontal: rem(1),
        alignSelf: "center",
        color: "#fff",
        fontFamily: "Inter_600SemiBold",
        marginBottom: 20,
    },
    boldText: {
        fontFamily:"Inter_800ExtraBold",
        color: "red"
    },
    link: {
        paddingVertical: 10,
    },
    linkText: {
        color: "#3c89fb",
        fontSize: rem(1.7),
        fontFamily: "Inter_600SemiBold"
    },
});
