import React, {useCallback, useEffect, useState} from 'react';
import {
    Text,
    ActivityIndicator,
    View,
    StyleSheet,
    Image,
    TextInput,
    FlatList,
    TouchableOpacity
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useRouter} from "expo-router";
import {
    getCurrentSpace,
    selectSortedSpaceMembers
} from "../../../../service/selectors/spaceSelectors";
import {getSpaceMembersAction} from "../../../../service/actions/spaceActions";
import {rem} from "../../../../utils/uiUtils";

export default function InSpaceMembers() {
    const dispatch = useDispatch();
    const router = useRouter();

    const [input, setInput] = useState('');
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const {currentMember, isMembersFetched} = useSelector(getCurrentSpace);
    const members = useSelector(selectSortedSpaceMembers);

    useEffect(() => {
        const fetchMembers = async () => {
            if (!isMembersFetched) {
                setLoading(true);
                await dispatch(getSpaceMembersAction());
                setLoading(false);
            }
        };
        fetchMembers();
    }, [dispatch]);

    const handleNavigateToStreak = (id, streak) => {
        if(streak === 0) return;
        router.push({
            pathname: "./member-streak",
            params: {id}
        })
    }

    useEffect(() => {
        if (members.length > 0) {
            setResult(members);
        }
    }, [members]);

    const handleSearch = useCallback((text) => {
        setInput(text);
        if (members.length === 0) return;
        if (text === "") {
            setResult(members);
        } else {
            const filteredObjects = members.filter(obj =>
                obj?.user?.username.toLowerCase().startsWith(text.toLowerCase()) ||
                obj?.user?.name.toLowerCase().startsWith(text.toLowerCase())
            );
            setResult(filteredObjects);
        }
    }, [members]);


    const handleNavigation = (memberId) => {
        if (currentMember.memberId === memberId) {
            router.push("./yourpage")
        } else {
            router.push({
                pathname: "./member/[memberId]",
                params: {memberId}
            })
        }
    }

    const renderMemberItem = ({item}) => (
        <TouchableOpacity
            style={styles.memberItem}
            onPress={() => handleNavigation(item.memberId)}
            delayPressIn={300}
        >
            <View>
                <Image source={{uri: item?.user?.profile}} style={styles.memberImage}/>
                <View style={item?.userOnline ? styles.online : null}/>
            </View>
            <View style={styles.memberDetails}>
                <Text style={styles.memberUsername}>{item?.user?.username}</Text>
                <Text style={styles.memberName}>{item?.user?.name}</Text>
            </View>
            {item?.admin && (
                <View style={styles.adminTag}>
                   <Text style={styles.adminText}>Admin</Text>
                </View>
            )}
            <TouchableOpacity style={styles.streakContainer} onPress={() => handleNavigateToStreak(item.memberId, item.streak)}>
                <View style={styles.streakIconContainer}>
                    <Image
                        source={require("../../../../assets/images/fire.png")}
                        style={styles.streakIcon}
                    />
                    <Text style={styles.streakCount}>{item.streak}</Text>
                </View>
                {item?.streak > 0 && (
                    <>
                        <View style={styles.middleLine} />
                        <View style={styles.streakTextContainer}>
                            <Text style={styles.streakCount}>
                                {item.lastStreak > 0 ? "+" : "-"} {item.lastStreak}
                            </Text>
                        </View>
                    </>
                )}
            </TouchableOpacity>
        </TouchableOpacity>
    );


    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    value={input}
                    onChangeText={handleSearch}
                    placeholderTextColor={"#000"}
                />
                {!input && (
                    <Image source={require("../../../../assets/images/magnifying-glass.png")}
                           style={styles.searchIcon}
                    />
                )}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff"/>
            ) : (
                <FlatList
                    style={styles.members}
                    data={result}
                    renderItem={renderMemberItem}
                    keyExtractor={(item) => item.memberId.toString()}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: rem(4),
        backgroundColor: '#000',
    },
    searchContainer: {
        position: "absolute",
        marginTop: rem(8),
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        alignSelf: "center",
        zIndex: 1000
    },
    searchInput: {
        backgroundColor: "#dfdfdf",
        width: 290,
        height: 38,
        borderRadius: 33,
        alignSelf: "center",
        fontSize: rem(1.6),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.05),
        paddingLeft: rem(2.5),
        color: "#000",
    },
    searchIcon: {
        position: "absolute",
        right: 15,
        width: 19,
        height: 19,
    },
    listContainer: {
        marginTop: rem(2),
        marginLeft: rem(1.7),
        flexDirection: "column",
        paddingBottom: 100
    },
    members: {
        paddingTop: rem(7.6),
    },
    memberItem: {
        flex: 1,
        gap: 6,
        flexDirection: 'row',
        alignItems: "center",
        marginBottom: rem(2.5)
    },
    memberImage: {
        width: 58,
        height: 58,
        borderRadius: 50,
        marginRight: 10,
    },
    memberDetails: {
        flex: 1,
        gap: rem(1)
    },
    memberUsername: {
        color: "#fff",
        fontSize: rem(1.4),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.06),
    },
    memberName: {
        fontSize: rem(1.3),
        fontFamily: "Inter_500Medium",
        color: '#6F6F6FFF',
        letterSpacing: rem(0.03),
    },
    adminTag: {
        position: "absolute",
        left: "53%",
        top: "30%",
        zIndex: 1001,
        backgroundColor: "#FF4C4C",
        paddingHorizontal: 8,
        paddingVertical: 1,
        borderRadius: 10,
    },
    adminText: {
        color: "#000",
        fontSize: 13,
        fontFamily: "Inter_600SemiBold"
    },
    online: {
        width: 18,
        height: 18,
        backgroundColor: "#4CAF50",
        borderRadius: 50,
        position: "absolute",
        bottom: 0,
        right: 9
    },
    streakContainer: {
        backgroundColor: "#1e1e1e",
        minWidth: 60,
        borderRadius: 20,
        zIndex: 1002,
        right: 15,
        justifyContent: "center",
        alignItems: "center",
        padding: 3,
    },
    streakCount: {
        fontSize: 13,
        color: "#fff",
        marginLeft: 5,
        fontFamily: "Inter_700Bold"
    },
    streakTextContainer: {
        flexDirection: "row",
        paddingTop: 4,
        alignItems: "center",
    },
    streakIcon: {
        width: 18,
        height: 18,
        alignSelf: "center"
    },
    streakIconContainer: {
        alignItems: "center",
        paddingHorizontal: 7,
        flexDirection: "row",
        alignSelf: "center",
        paddingBottom: 4
    },
    middleLine: {
        width: "80%",
        height: 2,
        backgroundColor: "#fff",
    },
})