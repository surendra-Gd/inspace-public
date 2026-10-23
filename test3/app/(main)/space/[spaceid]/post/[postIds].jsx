import {Text, StyleSheet} from "react-native";
import {useLocalSearchParams} from "expo-router";
import {useDispatch, useSelector} from "react-redux";
import {getCurrentSpace} from "../../../../../service/selectors/spaceSelectors";
import React, {useEffect, useState} from "react";
import {getSpaceMembersAction} from "../../../../../service/actions/spaceActions";
import ImageSlider from "../../../../../components/post/ImageSlider";
import {rem} from "../../../../../utils/uiUtils";
import PostView from "../../../../../components/post/PostView";


const Post = () => {
    const {postIds, spaceid} = useLocalSearchParams();
    const postArray = postIds?.split(',').map(Number);
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const {currentMember, isMembersFetched} = useSelector(getCurrentSpace);


    useEffect(() => {
        const fetchMember = () => {
            try {
                if (!isMembersFetched) {
                    setLoading(true);
                    dispatch(getSpaceMembersAction());
                }
            } finally {
                setLoading(false);
            }
        }
        fetchMember();
    }, [isMembersFetched]);


    if (loading && !isMembersFetched) {
        return (
            <Text style={styles.membersLoading}>
                {"Just a sec... the page is almost \nready! 🚀🔄"}
            </Text>
        )
    }


    return (
        <>
            {(postArray.length > 0) && (
                postArray?.length === 1
                    ? <PostView postId={postArray[0]}
                                currentMemberId={currentMember.memberId}
                                spaceId={spaceid}
                    />
                    : <ImageSlider posts={postArray}
                                   currentMemberId={currentMember.memberId}
                                   spaceId={spaceid}
                    />
            )}

        </>
    )
}

export default Post;


const styles = StyleSheet.create({
    pageContainer: {
        // flex: 1,
        // marginTop: rem(7),
    },
    scrollContent: {
        flexGrow: 1
    },
    userContainer: {
        marginTop: rem(0.5),
        marginVertical: rem(1),
        marginHorizontal: rem(1.7),
        gap: rem(1),
        flexDirection: "row",
        alignItems: "center"
    },
    userImage: {
        width: rem(4.2),
        height: rem(4.2),
        borderRadius: 50,
    },
    userDetails: {
        gap: rem(0.1)
    },
    username: {
        fontSize: rem(1.4),
        fontWeight: "Inter_500Medium",
        letterSpacing: rem(0.03),
        color: "#fff"
    },
    name: {
        fontSize: rem(1.3),
        textAlign: "left",
        fontFamily: "Inter_600SemiBold",
        color: "#6F6F6FFF",
        letterSpacing: rem(0.02)
    },
    header: {
        top: 0,
        width: '100%',
        height: 90,
        alignSelf: "flex-end",
        gap: 10,
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingTop: 30,
        zIndex: 1000,
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "space-between"
    },
    backContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        // gap: 1
    },
    subHeader: {
        flexDirection: "row",
        gap: 10,
        justifyContent: "center",
        alignItems: "center"
    },
    membersLoading: {
        top: "30%",
        alignSelf: "center",
        color: "#fff",
        fontFamily: "Inter_600SemiBold",
        fontSize: 15,
        paddingHorizontal: 30,
        textAlign: "center"
    }
})