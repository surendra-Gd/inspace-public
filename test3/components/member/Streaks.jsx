import {FlatList, Image, Pressable, StyleSheet, Text, View} from "react-native";
import React from "react";
import {rem} from "../../utils/uiUtils";


const Streaks = ({members, router}) => {
    const handleNavigateToStreak = (id) => {
        router.push({
            pathname: "./member-streak",
            params: {id}
        })
    }

    const renderMemberItem = ({ item }) => (
        <Pressable style={styles.memberItem} onPress={() => handleNavigateToStreak(item.memberId)}>
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
                    <Image source={require("../../assets/images/approved.png")}
                           style={{width: 30, height: 30}}
                    />
                </View>
            )}

            <View style={styles.streakContainer}>
                <Image source={require("../../assets/images/fire.png")}
                       style={{width:20, height:20}}
                />
                <Text style={{color: "#fff"}}>
                    Today {item.lastStreak}
                </Text>
            </View>

            <View style={styles.streakContainer}>
                <Image source={require("../../assets/images/fire.png")} style={{width:20, height:20}} />
                <Text style={{color: "#fff"}}>
                    {item.streak}
                </Text>
            </View>
        </Pressable>
    );

    return (
        <View style={{top: 10}}>
            <FlatList data={members}
                renderItem={renderMemberItem}
                keyExtractor={(item) => item.memberId.toString()}
            />
        </View>
    )

}

export default Streaks;

const styles = StyleSheet.create({
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
        right: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    online: {
        width: 15,
        height: 15,
        backgroundColor: "green",
        borderRadius: 50
    }
})