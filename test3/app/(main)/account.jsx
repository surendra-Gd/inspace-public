import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StyleSheet,
    Pressable,
    ActivityIndicator
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import {useRouter} from "expo-router";
import {FRIENDS_ERROR, SPACES_ERROR} from "../../service/constants/userConstants";
import {getFriendsAction, getUserSpacesAction} from "../../service/actions/userActions";
import {API} from "../../service/api/utils";
import {feedbackSchema} from "../../schemas/authSchemas";
import UserBanner from "../../components/shared/UserBanner";
import {rem} from "../../utils/uiUtils";
import RetryErrorComponent from "../../components/loader/RetryErrorComponent";
import Toast from "react-native-toast-message";
import ErrorComponent from "../../components/shared/ErrorComponent";
import UserBio from "../../components/shared/UserBio";
import {clearCurrentSpaceIdAction, setCurrentSpaceIdAction} from "../../service/actions/spaceActions";
import ProfileImageViewer from "../../components/shared/PostImageViewer";

export default function Account() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const account = useSelector(state => state.user) || {};
    const { userData: user, userSpaces, friends, spaces, users } = account;

    const { errors: fetchError } = useSelector(state => state.app);
    const friendsError = fetchError["friends"]?.error === FRIENDS_ERROR || false;
    const spacesError = fetchError["spaces"]?.error === SPACES_ERROR || false;

    useEffect(() => {
        const getAccount = async () => {
            await dispatch(getFriendsAction());
            await dispatch(getUserSpacesAction());
        };
        getAccount().finally(() => setLoading(false));
    }, [dispatch]);

    const friend = useMemo(() => friends?.map(id => users[id]), [friends]);

    const onSubmit = async (values, actions) => {
        if (errors.feedback) {
            const errMsg = errors.feedback || "Error: Please provide valid feedback";
            Toast.show({type: "error", text1: errMsg});
            return;
        }

        const request = {
            "feedback": values.feedback
        }

        try {
            const {data} = await API.post("users/feedback", request);
            const resMsg = data || "We truly appreciate your feedback!";
            Toast.show({type: "success", text1: resMsg})
            actions.resetForm();
        } catch (err) {
            const errorMessage = err.response?.data?.message || "An error occurred while sending feedback to InSpace.";
            Toast.show({type: "error", text1: errorMessage});
        }
    };

    const {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit
    } = useFormik({
        initialValues: { feedback: "" },
        validationSchema: feedbackSchema,
        onSubmit
    });

    const navigateToSpace = async (spaceId) => {
        try {
            await dispatch(setCurrentSpaceIdAction(spaceId));
        } finally {
            router.push({
                pathname: "/space/[spaceid]/home",
                params: {spaceid: spaceId}
            })
        }
    };

    if (loading) return <ActivityIndicator size={25} color="#fff" style={styles.loadingStyle} />;

    if(!user) return (
        <RetryErrorComponent errorMessage={"Some thing went wrong. Please reload the page"} />
    )

    return (
        <ScrollView>
            {user ? <View style={styles.accountContainer}>

                <View style={styles.profileSection}>
                    <View style={styles.container}>
                        <View style={styles.userSection}>
                            <ProfileImageViewer profilePic={user?.profile} picStyle={[styles.userImage]} />
                            <View style={styles.userDetails}>
                                <Text style={styles.name}>{user?.username}</Text>
                                <Text style={styles.userName}>{user?.name}</Text>
                            </View>
                        </View>
                        {user.status && <UserBio bio={user.status} />}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeading}>
                        <Text style={styles.sectionHeadingTitle}>Spaces</Text>
                    </View>

                    <ScrollView horizontal={!!userSpaces?.length}
                        contentContainerStyle={styles.accountSpacesList}
                        showsHorizontalScrollIndicator={false}
                    >
                        {spacesError ? (
                            <ErrorComponent msg={"Something went wrong while getting friends."} />
                        ) : userSpaces?.length ? (
                            userSpaces.map(userSpace => {
                                const space = spaces[userSpace.spaceId];
                                return (
                                    <Pressable key={space.spaceId} onPress={() => navigateToSpace(space.spaceId)} style={styles.spaceItem}>
                                        <Text style={styles.spaceName}>{space?.spacename}</Text>
                                        <Text style={styles.spaceId}>{space?.uniqueId}</Text>
                                    </Pressable>
                                );
                            })
                        ) : (
                            <Text style={styles.noMessage}>You haven’t joined any spaces. Find a space and start contributing!</Text>
                        )}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeading}>
                        <Text style={styles.sectionHeadingTitle}>Friends</Text>
                    </View>
                    <View style={styles.friendsList}>
                        {friendsError ? (
                            <ErrorComponent msg={"Something went wrong while getting friends."} />
                        ) : friend?.length ? (
                            friend.slice(0, 5).map(user => (
                                <View key={user.userId} style={styles.friendItem}>
                                    <UserBanner user={user} />
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noMessage}>No friends to show. Start connecting with people you know!</Text>
                        )}
                    </View>
                    {(!friendsError && friends?.length >= 5) && (
                        <TouchableOpacity onPress={() => router.push("/userfriends")} style={styles.buttonContainer}>
                            <Text style={styles.button}>See all</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeading}>
                        <Text style={styles.sectionHeadingTitle}>Contact</Text>
                    </View>
                    <View>
                        <TextInput id="feedback"
                            name="feedback"
                            style={styles.textArea}
                            onChangeText={handleChange("feedback")}
                            onBlur={handleBlur("feedback")}
                            value={values.feedback}
                            maxLength={200}
                            multiline
                            numberOfLines={8}
                            placeholder="Your feedback matters! Help us make InSpace even better!"
                            placeholderTextColor={"#6f6f6f"}
                        />
                        <TouchableOpacity onPress={() => handleSubmit()} disabled={isSubmitting || !values.feedback}>
                            <Text style={styles.inputButton}>{isSubmitting ? "Sending..." : "Send"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View> : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingStyle: {
        alignSelf: "center",
        top: "30%"
    },
    accountContainer: {
        paddingBottom: rem(0.1),
        backgroundColor: "#000",
        top: rem(0)
    },
    profileSection: {
        marginHorizontal: "2%",
        marginBottom: rem(2),
        paddingVertical: rem(0.5),
        paddingHorizontal: rem(0.2),
        borderBottomWidth: 2,
        borderBottomColor: "#1E1E1EFF"
    },
    container: {
        padding: rem(0.5),
    },
    userSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 25,
        marginBottom: 8
    },
    userImage: {
        width: rem(11),
        height: rem(11),
        borderRadius: 20,
        objectFit: "cover",
    },
    defaultProfile: {
        opacity: 0.5
    },
    userDetails: {
        justifyContent: "center",
        gap: 15,
        alignSelf: "flex-start",
        paddingTop: rem(1)
    },
    name: {
        fontSize: rem(2),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.1),
        color: "#fff",
    },
    userName: {
        fontSize: rem(1.7),
        fontFamily: "Inter_600SemiBold",
        letterSpacing: rem(0.03),
        color: "#6F6F6FFF",
    },
    section: {
        marginVertical: rem(1),
        marginBottom: rem(3),
    },
    sectionHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: rem(3),
        gap: 4
    },
    sectionHeadingTitle: {
        backgroundColor: "#6f6f6f",
        color: "#000",
        borderRadius: 8,
        borderCurve: "circular",
        fontSize: rem(1.4),
        fontFamily: "Inter_700Bold",
        paddingHorizontal: rem(1.4),
        paddingVertical: rem(0.2),
        letterSpacing: rem(0.03),
    },
    errorMessage: {
        color: "red",
        textAlign: "center",
        marginVertical: 8
    },
    noMessage: {
        paddingHorizontal: rem(1),
        textAlign: "center",
        fontSize: 14,
        color: "#6f6f6f",
        fontFamily: "Inter_500Medium"
    },
    accountSpacesList: {
        marginTop: rem(2),
        marginLeft: rem(0.5),
        paddingHorizontal: rem(1.5),
        alignItems: "center",
        gap: rem(3.5),
    },
    spaceItem: {
        flexDirection: "column",
        gap: rem(2.5),
        width: rem(21),
        height: rem(17.5),
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#1E1E1EFF",
        borderRadius: 15,
    },
    spaceName: {
        fontSize: rem(1.6),
        fontFamily: "Inter_600SemiBold",
        color: "#fff",
        letterSpacing: rem(0.03),
        textAlign: "center"
    },
    spaceId: {
        fontSize: rem(1.5),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.03),
        color: "#6F6F6FFF",
    },
    friendsList: {
        marginTop: rem(2),
        marginLeft: rem(0.5)
    },
    friendItem: {
        paddingLeft: rem(1.5),
        alignItems: "center",
        marginBottom: rem(2),
    },
    buttonContainer: {
        alignSelf: "center",
        marginVertical: rem(2.5)
    },
    button: {
        backgroundColor: "#3083FFFF",
        paddingVertical: rem(0.7),
        paddingHorizontal: rem(4),
        borderRadius: 20,
        borderCurve: "circular",
        fontSize: rem(1.6),
        fontFamily: "Inter_800ExtraBold",
        letterSpacing: rem(0.03)
    },
    textArea: {
        padding: rem(1.5),
        marginTop: rem(2),
        width: "92%",
        height: rem(14),
        alignSelf: "center",
        backgroundColor: "#1e1e1e",
        borderColor: "#2e2e2e",
        borderWidth: 1,
        borderRadius: 12,
        color: "#fff",
        fontSize: rem(1.4),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.05),
        textAlignVertical: "top"
    },
    inputButton: {
        backgroundColor: "#fff",
        marginVertical: rem(2.5),
        alignSelf: "center",
        paddingVertical: rem(0.8),
        width: "80%",
        borderRadius: rem(5),
        textAlign: "center",
        fontSize: rem(1.6),
        fontFamily: "Inter_800ExtraBold",
        letterSpacing: rem(0.05)
    }
});
