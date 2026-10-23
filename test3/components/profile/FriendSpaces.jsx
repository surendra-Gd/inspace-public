import React, { useMemo } from 'react';
import {View, Text, StyleSheet, FlatList, Image} from 'react-native';
import { useSelector } from 'react-redux';
import JoinSpaceModal from '../shared/JoinSpaceModal';
import {rem} from "../../utils/uiUtils";

const FriendSpaces = ({ friendsId }) => {
    const { friendSpaces, spaces: allSpaces } = useSelector(state => state.user);

    const spaces = useMemo(() => {
        const spaceIds = friendSpaces[friendsId]?.spaces;
        return spaceIds?.map(id => allSpaces[id]) || [];
    }, [friendSpaces, allSpaces, friendsId]);

    const renderSpaceItem = ({ item: space }) => {
        const { spaceId, spacename, uniqueId } = space;
        return (
            <View key={spaceId} style={styles.spaceItem}>
                <View style={styles.spaceItemDetails}>
                    <Text style={styles.spaceName}>{spacename}</Text>
                    <Text style={styles.spaceId}>{uniqueId}</Text>
                </View>
                <View style={styles.joinModal}>
                    <JoinSpaceModal
                        space={space}
                        className1={styles.buttonAdded}
                        className2={styles.buttonAdd}
                        joinButtonText={styles.buttonText}
                        requestButtonText={styles.buttonText}
                        errorType={true}
                    />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.section}>
            <View style={styles.headingContainer}>
                <Text style={styles.headingText}>Spaces</Text>
                <Image source={require("../../assets/images/chevron.png")} style={styles.headingIcon} />
            </View>

            <FlatList data={spaces}
                renderItem={renderSpaceItem}
                keyExtractor={(item) => item.spaceId.toString()}
                style={styles.spaceList}
                ListEmptyComponent={
                    <Text style={styles.noSpacesMessage}>
                        Your friend hasn't joined any spaces yet. Let's explore together!
                    </Text>
                }
                nestedScrollEnabled={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        padding: rem(0.5),
        marginTop: rem(2.5)
    },
    headingContainer: {
        marginLeft: rem(1.5),
        flexDirection: 'row',
        alignItems: "center",
        gap: 6
    },
    headingText: {
        color: "#fff",
        fontSize: rem(2.2),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.04)
    },
    headingIcon: {
        top: rem(0.2),
        width: 20,
        height: 20,
    },
    spaceList: {
        marginVertical: rem(2.5),
        marginHorizontal: rem(0.5)
    },
    spaceItem: {
        flexDirection: 'row',
        marginBottom: rem(2),
        position: "relative",
        alignItems: "flex-start",
        paddingVertical: rem(2),
        paddingLeft: rem(3),
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#1E1E1EFF',
    },
    spaceItemDetails: {
        flexDirection: "column",
        gap: rem(0.9)
    },
    spaceName: {
        fontSize: rem(1.6),
        fontFamily: "Inter_400Regular",
        color: "#fff",
        letterSpacing: rem(0.03)
    },
    spaceId: {
        fontSize: rem(1.4),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.03),
        color: "#6F6F6FFF",
        marginBottom: rem(0.5)
    },
    joinModal: {
        position: "absolute",
        right: "3%",
        width: rem(11),
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        zIndex: 100
    },
    buttonAdded: {
        alignSelf: "center",
        backgroundColor: "#1e1e1e",
        paddingVertical: rem(0.4),
        paddingHorizontal: rem(1),
        borderRadius: 50,
    },
    buttonAdd: {
        alignSelf: "center",
        borderRadius: 50,
        paddingVertical: rem(0.4),
        paddingHorizontal: rem(1.4),
        backgroundColor: "#fff"
    },
    buttonText: {
        color: '#000',
        fontSize: rem(1.3),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.04)
    },
    noSpacesMessage: {
        fontFamily: "Inter_600SemiBold",
        marginTop: 20,
        textAlign: 'center',
        color: '#888',
    },
});

export default FriendSpaces;