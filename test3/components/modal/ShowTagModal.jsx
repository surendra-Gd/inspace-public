import {FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {rem} from "../../utils/uiUtils";
import {useSelector} from "react-redux";
import {selectMembersByIds} from "../../service/selectors/spaceSelectors";

const ShowTagModal = (
    {tagged, isVisible, onClose, handleMemberNavigation}
) => {

    const members = useSelector((state) => selectMembersByIds(state, tagged));

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity style={styles.memberCard} onPress={() => handleMemberNavigation(item.memberId)}>
                <Image source={{ uri: item.user.profile }} style={styles.profileImage} />
                <View style={styles.userDetails}>
                    <Text style={styles.username}>{item.user.username}</Text>
                    <Text style={styles.name}>{item.user.name}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <Modal visible={isVisible}
               animationType="fade"
               transparent={true}
               onRequestClose={() => onClose()}
        >
            <View onPress={() => onClose()} style={styles.modalOverlay} pointerEvents="box-none">
                <View style={styles.modalContainer}>
                    <View style={styles.container}>
                        <Text style={styles.heading}>Tagged Members</Text>
                        <FlatList
                            data={members}
                            keyExtractor={(item) => item.memberId?.toString()}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                            style={styles.membersContainer}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>
                                        No tagged members yet! 🤷‍♂️✨ Just an empty space...
                                    </Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </View>
        </Modal>
    )

}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContainer: {
        width: '100%',
        height: "100%",
        borderRadius: 20,
        padding: 10,
    },
    container: {
        backgroundColor: "#1e1e1e",
        top: "10%",
        maxHeight: 400,
        marginHorizontal: 10,
        borderRadius: 20,
    },
    heading: {
        marginTop: 10,
        alignSelf: "center",
        color: "#fff",
        fontSize: 16,
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.02)
    },
    membersContainer: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#6f6f6f",
        marginBottom: 5,
        marginHorizontal: 10
    },
    memberCard: {
        marginVertical: 5,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 15
    },
    userDetails: {
        flexDirection: "column",
        rowGap: 3,
        flex: 1
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 30,
        marginBottom: 5,
    },
    name: {
        fontSize: 13,
        color: "#6f6f6f",
        fontFamily: "Inter_500Medium"
    },
    username: {
        fontSize: 13,
        color: "#fff",
        fontFamily: "Inter_600SemiBold"
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 4,
        alignSelf: "center",
        right: 15
    },
    checked: {
        backgroundColor: 'green',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
    },
})

export default ShowTagModal;