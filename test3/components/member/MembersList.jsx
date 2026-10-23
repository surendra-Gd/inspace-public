import React, {useCallback, useEffect, useState} from "react";
import {FlatList, Image, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import {rem} from "../../utils/uiUtils";


const MembersList = ({members, currentMember, router}) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState([]);

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
        if(currentMember.memberId === memberId) {
            router.push("./yourpage")
        } else {
            router.push({
                pathname: "./member/[memberId]",
                params: {memberId}
            })
        }
    }

    const renderMemberItem = ({ item }) => (
        <Pressable style={styles.memberItem} onPress={() => handleNavigation(item.memberId)}>
            <View style={styles.memberImage}>
                <Image source={{ uri: item?.user?.profile }} style={styles.memberImage} />
                <View style={item?.userOnline ? styles.online : null}/>
            </View>
            <View style={styles.memberDetails}>
                <Text style={styles.memberUsername}>{item?.user?.username}</Text>
                <Text style={styles.memberName}>{item?.user?.name}</Text>
            </View>
            {item?.admin && (
                <View style={styles.adminTag}>
                    <Image source={require("../../assets/images/approved.png")} style={{width: 20, height: 20}}/>
                </View>
            )}
            <View style={styles.streakContainer}>
                <Image source={require("../../assets/images/fire.png")} style={{width:20, height:20}} />
                <Text style={styles.streakCount}>{item.streak}</Text>
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput style={styles.searchInput}
                    placeholder="Search"
                    value={input}
                    onChangeText={handleSearch}
                    placeholderTextColor={"#d9d9d9"}
                />
                {!input && (
                    <Image source={require("../../assets/images/magnifying-glass.png")}
                           style={styles.searchIcon}
                    />
                )}
            </View>

            <FlatList
                style={styles.members}
                data={result}
                renderItem={renderMemberItem}
                keyExtractor={(item) => item.memberId.toString()}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

export default MembersList;

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        // paddingTop: rem(4),
        backgroundColor: '#000',
    },
    searchContainer: {
        position: "absolute",
        marginTop: rem(2),
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        alignSelf: "center",
        zIndex: 1000
    },
    searchInput: {
        backgroundColor: "#1e1e1e",
        width: 290,
        height: 38,
        borderRadius: 33,
        alignSelf: "center",
        fontSize: rem(1.6),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.05),
        paddingLeft: rem(2.5),
        color: "#fff",
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
        flexDirection: "column"
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
        width: 60,
        height: 60,
        borderRadius: 50,
        marginRight: 10,
    },
    memberDetails: {
        flex: 1,
        gap: rem(1)
    },
    memberUsername: {
        color: "#fff",
        fontSize: rem(1.5),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.06),
    },
    memberName: {
        fontSize: rem(1.4),
        fontFamily: "Inter_500Medium",
        color: '#6F6F6FFF',
    },
    adminTag: {
        marginRight: rem(2)
    },
    streakContainer: {
        // flexDirection: "row",
        // gap: 10,
        right: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    streakCount: {
        fontFamily: "Inter_600SemiBold",
        color: "#fff"
    },
    online: {
        width: 15,
        height: 15,
        backgroundColor: "green",
        borderRadius: 50
    }
});