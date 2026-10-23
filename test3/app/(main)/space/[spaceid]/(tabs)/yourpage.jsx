import {View, Text, Image, StyleSheet, Pressable, FlatList} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {selectCurrentMember} from "../../../../../service/selectors/spaceSelectors";
import {useRouter} from "expo-router";
import MemberPosts from "../../../../../components/main/MemberPosts";
import {rem} from "../../../../../utils/uiUtils";

export default function InSpaceUserPage() {
    const dispatch = useDispatch();
    const router = useRouter();

    const currentMember = useSelector(selectCurrentMember) || null;
    const { memberId } = currentMember;
    const { profile, username, name } = currentMember?.user;

    const handleViewProfileNavigation = () => {
        router.push('/account');
    };


    return (
        <FlatList data={[{ key: 'profile' }]}
            renderItem={() => (
                <View style={styles.container}>
                    {profile && (
                        <Image source={{ uri: profile }} style={styles.userImage} />
                    )}
                    <Text style={styles.username}>{username}</Text>
                    <Text style={styles.name}>{name}</Text>
                    <Pressable onPress={handleViewProfileNavigation} style={styles.buttonContainer}>
                        <Text style={styles.buttonText}>View Profile</Text>
                    </Pressable>
                    {currentMember && <MemberPosts member={currentMember} dispatch={dispatch} key={memberId} />}
                </View>
            )}
            keyExtractor={(item) => item.key}
            style={styles.section}
        />

    );
}

const styles = StyleSheet.create({
    section: {
      backgroundColor: "#000",
      flex: 1
    },
    container: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: rem(6),
        paddingBottom: rem(9)
    },
    userImage: {
        width: 110,
        height: 110,
        borderRadius: 100,
        objectFit: "cover"
    },
    username: {
        fontSize: rem(1.9),
        fontFamily: "Inter_600SemiBold",
        marginTop: rem(0.5),
        marginBottom: rem(0.3),
        letterSpacing: rem(0.02),
        color: "#fff"
    },
    name: {
        color: "#6F6F6FFF",
        marginVertical: rem(0.1),
        fontSize: rem(1.6),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.04),
        textAlign: "center"
    },
    buttonContainer: {
        backgroundColor: "#fff",
        width: rem(12),
        height: rem(2.8),
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        marginTop: rem(1.5),
    },
    buttonText: {
        fontSize: rem(1.4),
        fontFamily: "Inter_800ExtraBold",
        color: "#000",
    }
});