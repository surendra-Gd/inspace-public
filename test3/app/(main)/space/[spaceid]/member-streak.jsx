import {Stack, useLocalSearchParams, useRouter} from "expo-router";
import {useDispatch, useSelector} from "react-redux";
import {selectMemberById, getStreaksByMemberId, getCurrentSpace} from "../../../../service/selectors/spaceSelectors";
import {Image, Text, TouchableOpacity, View, StyleSheet, FlatList, ActivityIndicator, Pressable} from "react-native";
import React, {Fragment, useEffect, useCallback, useState} from "react";
import {useDates} from "../../../../hooks/useDates";
import {rem} from "../../../../utils/uiUtils";
import {getStreaksAction} from "../../../../service/actions/textActions";
import {selectIsErrorExists} from "../../../../service/selectors/appSelectors";
import {GET_STREAK_ERROR} from "../../../../service/constants/spaceConstants";


export default function MemberStreak() {
    const {id} = useLocalSearchParams();
    const dispatch = useDispatch();
    const member = useSelector(state => selectMemberById(state, id));
    const page = member?.streaksPage;
    const router = useRouter();
    const {currentMember} = useSelector(getCurrentSpace);
    const streaks = useSelector(state => getStreaksByMemberId(state, id));
    const calender = useDates(member?.joinedOn);
    const [loading, setLoading] = useState(false);

    const streakError = useSelector((state) =>
        selectIsErrorExists(state, id, "GET_STREAK_ERROR"))

    const handleNavigation = () => {
        if (currentMember.memberId === member?.memberId) {
            router.push("./yourpage")
        } else {
            router.push({
                pathname: "./member/[memberId]",
                params: {memberId: member?.memberId}
            })
        }
    }

    const fetchStreaks = useCallback(() => {
        if(streakError) return;
        if (!page || (page?.hasNext && !loading)) {
            setLoading(true);
            const fetchPage = page ? page.currentPage + 1 : 0;
            try {
                dispatch(getStreaksAction(fetchPage, id));
            } finally {
                setLoading(false);
            }
        }
    }, [dispatch, id, page]);

    useEffect(() => {
        if(!page) fetchStreaks();
    }, [page]);

    const onViewableItemsChanged = useCallback(
        ({viewableItems}) => {
            if (viewableItems.length === 0 || !page) return;
            if (page?.hasNext && viewableItems[0]?.item?.date <= page?.pageLastDate) {
                fetchStreaks();
            }
        },
        [fetchStreaks, page]
    );


    const renderDate = useCallback(
        (item) => {
            const dateStreak = streaks?.find(s => s.timeStamp === item?.date);
            return (
                <View style={styles.dateItem}>
                    <Text style={styles.date}>
                        {String(item?.day).padStart(2, '0')}
                    </Text>
                    <View style={styles.streakContainer}>
                        {(!page || (page?.pageLastDate >= item?.date) && loading) ? (
                            <ActivityIndicator size={15} color={"#fff"}/>
                        ) : (
                            <Text style={styles.streakText}>
                                🔥 {dateStreak?.streak || 0}
                            </Text>
                        )}
                    </View>
                </View>
            );
        },
        [streaks, page?.pageLastId]
    );


    const MonthItem = React.memo(({month}) => (
        <View style={styles.monthContainer}>
            <Text style={styles.monthTitle}>{month.month}</Text>
            <FlatList
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
                columnWrapperStyle={styles.postsGrid}
                numColumns={5}
                data={month.days}
                renderItem={({item}) => renderDate(item)}
                keyExtractor={(day) => day.date}
            />
        </View>
    ));


    const pageHeader = () => (
        <View style={styles.header}>
            <View style={styles.backContainer}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Image source={require("../../../../assets/images/back (1).png")} style={{width: 20, height: 20}}/>
                </TouchableOpacity>
                <Pressable onPress={handleNavigation} style={styles.subHeader}>
                    <Image source={{uri: member.user.profile}} style={{width: 44, height: 44, borderRadius: 50}}/>
                    <View>
                        <Text style={styles.title}>{member.user.username}</Text>
                        <View style={{flexDirection: "row", alignItems: "center", gap: 5}}>
                            <Image source={require("../../../../assets/images/fire.png")}
                                   style={{width: 17, height: 17}}/>
                            <Text style={{
                                fontSize: 14,
                                color: "#fff",
                                fontFamily: "Inter_800ExtraBold"
                            }}>{member.streak}</Text>
                        </View>
                    </View>
                </Pressable>
            </View>
        </View>
    );


    if(streakError) {
        return (
            <Text style={styles.streakError}>
                Uh-oh! 🚨 Couldn’t fetch member streaks. Try again!
            </Text>
        )
    }

    return (
        <>
            <Stack.Screen options={{header: () => pageHeader()}}/>
            <View style={styles.viewContainer}>
                <FlatList
                    inverted
                    showsVerticalScrollIndicator={false}
                    data={calender}
                    renderItem={({item}) => <MonthItem month={item}/>}
                    keyExtractor={(month) => month.month}
                    style={styles.monthContainer}
                />
                <Text style={{color: "#fff"}}>You Joined On {member?.joinedOn}</Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        top: 0,
        width: '100%',
        height: 93,
        alignSelf: "flex-end",
        gap: 15,
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingTop: 25,
        zIndex: 1000,
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "space-between"
    },
    backContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10
    },
    title: {
        fontFamily: "Inter_600SemiBold",
        fontSize: 15,
        letterSpacing: 0.9,
        color: "#fff"
    },
    subHeader: {
        flexDirection: "row",
        gap: 10,
        justifyContent: "center",
        alignItems: "center"
    },
    viewContainer: {
        paddingHorizontal: rem(1.5),
    },
    yearContainer: {
        marginVertical: rem(0.5)
    },
    year: {
        fontFamily: "Inter_800ExtraBold",
        color: "#fff",
        alignSelf: "center",
        fontSize: rem(2.5)
    },
    monthContainer: {
        marginVertical: rem(1)
    },
    monthTitle: {
        color: "#6f6f6f",
        fontFamily: "Inter_700Bold",
        fontSize: rem(1.8),
        paddingBottom: rem(1)
    },
    dateItem: {
        alignItems: "center",
        justifyContent: "center",
        width: 50,
    },
    date: {
        fontFamily: "Inter_600SemiBold",
        fontSize: rem(2),
        color: "#fff"
    },
    postsGrid: {
        gap: 20,
        alignItems: "center",
        marginBottom: 10
    },
    streakText: {
        fontSize: 12,
        color: '#fff',
        backgroundColor: "#1e1e1e",
        padding: 3,
        borderRadius: 50
    },
    streakError: {
        fontSize: 14,
        color: "rgba(255,0,0,0.91)",
        fontFamily: "Inter_600SemiBold",
        paddingHorizontal: 10,
        textAlign: "center",
        marginTop: 30
    }
})