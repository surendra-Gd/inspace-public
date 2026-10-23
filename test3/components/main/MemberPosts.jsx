import React, {useState, useEffect, Fragment, useCallback} from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {useSelector} from 'react-redux';
import MemberPost from '../shared/MemberPost';
import {groupPostsByMonthAndDate} from "../../utils";
import {getMemberPostsAction} from "../../service/actions/spaceActions";
import {selectPostsByMemberId} from "../../service/selectors/spaceSelectors";
import {MEMBER_POST_ERROR} from "../../service/constants/spaceConstants";
import {postWidth, rem} from "../../utils/uiUtils";


const RenderMemberPost = React.memo(({posts}) => {
    return <MemberPost posts={posts} />;
});


const MemberPosts = ({member, dispatch}) => {
    const [loading, setLoading] = useState(true);
    const {memberId, postPage} = member;

    const memberPosts = useSelector(state =>
        selectPostsByMemberId(state, memberId)
    );
    const [groupedPosts, setGroupedPosts] = useState([]);


    const {errors} = useSelector(state => state.app);
    const error = errors[memberId];
    const memberPostsError = error?.error === MEMBER_POST_ERROR ? error?.message : false;


    const renderItem = useCallback(({item}) => {
        return <RenderMemberPost posts={item.posts} />;
    }, [groupedPosts]);


    useEffect(() => {
        const grouped = groupPostsByMonthAndDate(memberPosts);
        setGroupedPosts(grouped);
    }, [memberPosts]);

    const fetchPosts = useCallback(async () => {
        if (!postPage || (postPage?.hasNext && !loading)) {
            setLoading(true);
            const fetchPage = postPage ? postPage.currentPage + 1 : 0;
            await dispatch(getMemberPostsAction(fetchPage, memberId));
            setLoading(false);
        }
    }, [postPage, member, loading, dispatch])



    useEffect(() => {
        if (memberPostsError) return;
        fetchPosts().finally(() => setLoading(false));
    }, [postPage, dispatch]);

    if (!loading && postPage?.totalElements === 0) return;

    return (
        <View style={styles.container}>
            {groupedPosts?.length > 0 ? (
                groupedPosts?.map((data) => (
                    <View key={data.id}>
                        <Text style={styles.monthYear}>{data.month}</Text>
                        <FlatList showsVerticalScrollIndicator={false}
                                  data={data.posts}
                                  keyExtractor={(item) => item.id}
                                  renderItem={renderItem}
                                  onEndReached={fetchPosts}
                                  onEndReachedThreshold={0.5}
                                  numColumns={3}
                                  style={styles.postContainer}
                                  columnWrapperStyle={styles.postsGrid}
                                  nestedScrollEnabled={true}
                                  windowSize={5}
                        />
                    </View>
                ))
            ): (
                <Text>Fall back ui</Text>
            )}
            {loading && (
                <ActivityIndicator color={"#6f6f6f"} size={"small"} style={styles.postLoading}/>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 0,
        marginTop: rem(1),
        width: "100%",
    },
    showOnlyPosts: {
        position: "absolute",
        top: 15,
        width: 19,
        height: 19,
        right: "5%",
    },
    monthYear: {
        marginTop: rem(4),
        marginLeft: rem(1.5),
        marginBottom: rem(1.2),
        fontSize: rem(1.3),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.03),
        color: "#3083FFFF",
    },
    postContainer: {
        paddingHorizontal: 5,
        width: "100%"
    },
    postsGrid: {
        gap: 5,
        alignSelf: "center",
        width: "100%",
        alignItems: "center",
        marginBottom: 5
    },
    emptyPostContainer: {
        position: "relative",
        borderWidth: 1,
        borderColor: "#131313",
        width: postWidth()
    },
    emptyPostDiv: {
        width: "100%",
        aspectRatio: "1/1"
    },
    postDate: {
        position: "absolute",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        paddingVertical: rem(0.3),
        paddingHorizontal: rem(0.4),
        borderRadius: 50,
        fontSize: rem(0.8),
        fontFamily: "Inter_600SemiBold",
        textAlign: "center",
        bottom: rem(0.3),
        left: rem(0.4),
    },
    postLoading: {
        marginVertical: rem(3),
        alignSelf: "center"
    }
});

export default MemberPosts;

/*
import React, {useState, useEffect, Fragment, useCallback, useMemo} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Dimensions,
    Pressable
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import MemberPost from '../shared/MemberPost';
import {groupPostsByMonthAndDate, showOnlyPosts} from "../../utils";
import {getMemberPostsAction} from "../../service/actions/spaceActions";
import {getCurrentSpace, selectPostsByMemberId} from "../../service/selectors/spaceSelectors";
import { MEMBER_POST_ERROR } from "../../service/constants/spaceConstants";
import {postWidth, rem} from "../../utils/uiUtils";
import {setShowPostAction} from "../../service/actions/appActions";

import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";


const RenderMemberPost = React.memo(({ posts, id }) => {
    return <MemberPost posts={posts} />;
});

const RenderMonth = React.memo(({ month }) => {
    return (
        <Text style={styles.monthYear}>
            {month}
        </Text>
    );
});


const SCREEN_WIDTH = Dimensions.get("window").width;
const POST_WIDTH = SCREEN_WIDTH / 3;

const MemberPosts = ({ memberId, user }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    const memberPage = useSelector(getCurrentSpace)?.memberPages[memberId] || {};
    const { page, posts } = memberPage;
    const memberPost = useSelector(state => selectPostsByMemberId(state, memberId));

    const [groupedPosts, setGroupedPosts] = useState([]);

    const [dataProvider, setDataProvider] = useState(
        new DataProvider((r1, r2) => r1.id !== r2.id).cloneWithRows([])
    );

    const {errors, showPost} = useSelector(state => state.app);
    const error = errors[memberId];
    const isOnlyShowPosts = showPost[memberId];
    const memberPostsError = error?.error === MEMBER_POST_ERROR ? error?.message : false;

    const showOnlyPostsIcon = require("../../assets/images/copy (1).png");

    const layoutProvider = useMemo(
        () =>
            new LayoutProvider(
                (index) => (groupedPosts[index]?.type === "month" ? "MONTH" : "POST"),
                (type, dim) => {
                    if (type === "POST") {
                        dim.width = POST_WIDTH;
                        dim.height = POST_WIDTH;
                    } else if(type === "MONTH") {
                        dim.width = SCREEN_WIDTH; // Full screen width for the month header
                        dim.height = 150; // Static height for the month header
                    } else {
                        dim.width = SCREEN_WIDTH;
                        dim.height = 200;
                    }
                }
            ),
        [groupedPosts]
    );



    useEffect(() => {
        const grouped = groupPostsByMonthAndDate(memberPost);
        setGroupedPosts(grouped);
    }, [memberPost]);

    // Update Data Provider when Group Messages Change
    useEffect(() => {
        setDataProvider(
            new DataProvider((r1, r2) => r1.id !== r2.id)
                .cloneWithRows(groupedPosts)
        );
    }, [(prev) => groupedPosts]);


    const renderPostCard = useCallback(
        (type, data) => {
            if (data.type === "month") {
                return <RenderMonth month={data.month} />
            } else if(data.type === "head") {
                return (
                    <View style={styles.container}>
                        <Image source={{ uri: user.profile }} style={styles.userImage} />
                        <Text style={styles.username}>{user.username}</Text>
                        <Text style={styles.name}>{user.name}</Text>
                        <Pressable onPress={() => {}} style={styles.buttonContainer}>
                            <Text style={styles.buttonText}>View Profile</Text>
                        </Pressable>
                    </View>
                );
            }
            return (
                <RenderMemberPost posts={data.posts} id={data.id} />
            );
        },
        [memberId]
    );

    const fetchPosts = useCallback(async () => {
        if (!page || (page?.hasNext && !loading)) {
            setLoading(true);
            const fetchPage = page ? page.currentPage + 1 : 0;
            await dispatch(getMemberPostsAction(fetchPage, memberId));
            setLoading(false);
        }
    }, [page, memberId, loading, dispatch])

    useEffect(() => {
        if (memberPostsError) return;
        fetchPosts().finally(() => setLoading(false));
    }, [page, dispatch]);

    if (!loading && page?.totalElements === 0) return;

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => dispatch(setShowPostAction(memberId, !isOnlyShowPosts))}>
                <Image source={showOnlyPostsIcon} style={styles.showOnlyPosts} />
            </TouchableOpacity>
            {memberPost.length > 0 ? (
                <RecyclerListView
                    dataProvider={dataProvider}
                    layoutProvider={layoutProvider}
                    rowRenderer={renderPostCard}
                    onEndReached={fetchPosts}
                    onEndReachedThreshold={0.5}
                    style={styles.chatContainer}
                    recycleBin={{ maxSize: 50 }}
                    // renderFooter={renderFooter}
                    scrollEventThrottle={16}
                    // onScroll={handleRecyclerScroll}
                />
            ) : (
                <View style={styles.emptyChatContainer}>
                    <Text style={styles.emptyChatPlaceholder}>No Messages Yet 🚫💬</Text>
                </View>
            )}
            {loading && (
                <ActivityIndicator color={"#6f6f6f"} size={"small"}  style={styles.postLoading}/>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        zIndex: 0,
        marginTop: rem(1),
    },
    showOnlyPosts: {
        position: "absolute",
        top: 15,
        width: 19,
        height: 19,
        right: "5%",
    },
    monthYear: {
        marginTop: rem(4.5),
        marginLeft: rem(1.5),
        marginBottom: rem(1.2),
        fontSize: rem(1.3),
        fontFamily: "Inter_800ExtraBold",
        letterSpacing: rem(0.03),
        color: "#3083FFFF",
    },
    postContainer: {
        paddingHorizontal: 5,
        width: "100%"
    },
    postsGrid: {
        gap: 5,
        alignSelf: "center",
        width: "100%",
        alignItems: "center",
        marginBottom: 5
    },
    emptyPostContainer: {
        position: "relative",
        borderWidth: 1,
        borderColor: "#131313",
        width: postWidth()
    },
    emptyPostDiv: {
        width: "100%",
        aspectRatio: "1/1"
    },
    postDate: {
        position: "absolute",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        paddingVertical: rem(0.3),
        paddingHorizontal: rem(0.4),
        borderRadius: 50,
        fontSize: rem(0.8),
        fontFamily: "Inter_600SemiBold",
        textAlign: "center",
        bottom: rem(0.3),
        left: rem(0.4),
    },
    postLoading: {
        marginVertical: rem(3),
        alignSelf: "center"
    }
});

export default MemberPosts;
*/
