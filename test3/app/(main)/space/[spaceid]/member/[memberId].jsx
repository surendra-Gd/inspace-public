import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {Stack, useLocalSearchParams, useRouter} from "expo-router";
import React, {Fragment, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getCurrentSpace, selectMemberById} from "../../../../../service/selectors/spaceSelectors";
import {MEMBER_PAGE_ERROR} from "../../../../../service/constants/spaceConstants";
import {getMemberPageAction} from "../../../../../service/actions/spaceActions";
import MemberPosts from "../../../../../components/main/MemberPosts";
import {rem} from "../../../../../utils/uiUtils";
import ShiftAdminModal from "../../../../../components/modal/ShiftAdminModal";
import MemberRemovalModal from "../../../../../components/modal/MemberRemovalModal";
import ErrorComponent from "../../../../../components/shared/ErrorComponent";


// Todo: lot of fallbacks consider later.
const MemberPage = () => {
    const {memberId} = useLocalSearchParams();
    const router = useRouter();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [adminModalOpen, setAdminModalOpen] = useState(false);
    const [removeModalOpen, setRemoveModalOpen] = useState(false);
    const [memberNotFound, setMemberNotFound] = useState(false);

    const {currentMember} = useSelector(getCurrentSpace);
    const isAdmin = currentMember?.admin;


    const member = useSelector(state => selectMemberById(state, memberId)) || null;
    const { profile, username, name } = member?.user || {};


    const {errors} = useSelector(state => state.app);
    const memberPageError = errors[memberId]?.error === MEMBER_PAGE_ERROR || false;


    // Effect 1: Handle redirection if the current member is viewing their own page
    useEffect(() => {
        if (currentMember.memberId === memberId) {
            router.replace("../yourpage");
        }
    }, [currentMember.memberId, memberId, router]);


    // Effect 2: Fetch member data if the memberId is valid
    useEffect(() => {
        if (currentMember.memberId === memberId) return;

        const fetchData = async () => {
            if (memberPageError) return;
            setLoading(true);
            try {
                if (memberId) {
                    // Todo: Fetch member data from the backend
                    // await dispatch(getMemberPageAction(memberId));
                } else {
                    setMemberNotFound(true);
                }
            } catch (err) {
                setMemberNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dispatch, memberId, currentMember.memberId, memberPageError]);

    const handleViewProfileNavigation = () => {
        router.push({
            pathname: "/profile/[username]",
            params: {username: username}
        });
    };

    const pageHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backContainer}>
                <Image source={require("../../../../../assets/images/back (1).png")} style={{width: 20, height: 20}} />
                <Text style={styles.title}>Member</Text>
            </TouchableOpacity>
            {(isAdmin && member) && (
                <View style={styles.actionIcons}>
                    <TouchableOpacity onPress={() => setAdminModalOpen(true)}
                                      style={styles.actionIcon}>
                        <Image source={require("../../../../../assets/images/approved.png")}
                               style={{width: 30, height: 30}}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setRemoveModalOpen(true)}
                                      style={styles.actionIcon}
                    >
                        <Image source={require("../../../../../assets/images/logout.png")}
                               style={{width: 23, height: 23}}/>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )


    if(loading) return <ActivityIndicator size="large" color="#fff" />


    if(memberNotFound || memberPageError) {
        return (
            <View style={styles.errorContainer}>
                {
                    memberPageError
                        ? <ErrorComponent msg={"Something went wrong. please try again later."} />
                        : <Text style={styles.errorMsg}>Member not found. Maybe they’re chilling in another space? 🤔</Text>
                }
            </View>
        )
    }


    return (
        <Fragment>
            <Stack.Screen options={{header: () => pageHeader()}} />

            <FlatList data={[{ key: 'profile' }]}
                showsVerticalScrollIndicator={false}
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
                        {member && <MemberPosts member={member} dispatch={dispatch} key={memberId}/>}
                    </View>
                )}
                keyExtractor={(item) => item.key}
                style={styles.section}
            />

            {adminModalOpen && (
                <ShiftAdminModal targetUserId={memberId}
                    targetUsername={member?.user?.username}
                    onClose={() => setAdminModalOpen(false)}
                    dispatch={dispatch}
                    isVisible={adminModalOpen}
                />
            )}

            {removeModalOpen && (
                <MemberRemovalModal isVisible={removeModalOpen}
                    memberId={memberId}
                    onClose={() => setRemoveModalOpen(false)}
                    dispatch={dispatch}
                />
            )}
        </Fragment>
    );
}

export default MemberPage;

const styles = StyleSheet.create({
    header: {
        top: 0,
        width: '100%',
        height: 70,
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
        fontSize: 18,
        letterSpacing: 0.9,
        color: "#fff"
    },
    actionIcons: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12
    },
    section: {
        backgroundColor: "#000",
        height:"100%"
    },
    container: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: rem(1),
        paddingBottom: rem(5)
    },
    userImage: {
        width: rem(11),
        height: rem(11),
        borderRadius: 100,
        objectFit: "cover",
    },
    username: {
        fontSize: rem(1.9),
        fontFamily: "Inter_600SemiBold",
        marginVertical: rem(0.5),
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
        marginTop: rem(1.5)
    },
    buttonText: {
        fontSize: rem(1.4),
        fontFamily: "Inter_800ExtraBold",
        color: "#000",
    },
    errorContainer: {
        marginTop: rem(10),
        alignSelf: "center",
        paddingHorizontal: rem(2)
    },
    errorMsg: {
        fontSize: rem(1.7),
        fontFamily: "Inter_700Bold",
        textAlign: "center",
        color: "#3c89fb"
    }
});