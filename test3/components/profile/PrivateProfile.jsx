import React, { useEffect, useMemo, useState } from "react";
import {View, Text, StyleSheet, ActivityIndicator, Image} from "react-native";
import AddRequest from "../shared/AddRequest";
import RemoveRequest from "../shared/RemoveRequest";
import AcceptRejectBtn from "../shared/AcceptRejectBtn";
import { useDispatch, useSelector } from "react-redux";
import { getProfileStatusAction } from "../../service/actions/userActions";
import ProfileCard from "../shared/ProfileCard";
import { PROFILE_STATUS_ERROR } from "../../service/constants/userConstants";
import ErrorComponent from "../shared/ErrorComponent";
import {rem} from "../../utils/uiUtils";

const PrivateProfile = ({ profile }) => {
    const dispatch = useDispatch();
    const { user, request } = profile;
    const [loading, setLoading] = useState(false);

    const { incomingRequests, outgoingRequests } = useSelector(state => state.user);
    const { errors } = useSelector(state => state.app);
    const requestError = errors[user?.userId]?.error === PROFILE_STATUS_ERROR || false;

    const incomingRequest = useMemo(() => {
        return incomingRequests?.find(request => request?.user.userId === user.userId);
    }, [user, incomingRequests]);

    const outgoingRequest = useMemo(() => {
        return outgoingRequests?.find(request => request?.user.userId === user.userId);
    }, [user, outgoingRequests]);

    useEffect(() => {
        if (!request && !requestError) {
            setLoading(true);
            dispatch(getProfileStatusAction(user.userId))
                .finally(() => setLoading(false));
        }
    }, [request, dispatch, user]);


    return (
        <>
            <View style={styles.profileCardSection}>
                <ProfileCard user={user} incomingRequest={incomingRequest} outgoingRequest={outgoingRequest} />
            </View>

            <View style={styles.privacyContainer}>
                <Image source={require("../../assets/images/insurance.png")} style={styles.privacyIcon} />
                <Text style={styles.privacyMessage}>
                    Only Friends can see{"\n"}this profile.
                </Text>
            </View>

            {requestError ? (
                <ErrorComponent msg="Something went wrong while getting profile status." />
            ) : (
                <View style={styles.requestContainer}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#6f6f6f" />
                    ) : (
                        (request || incomingRequest || outgoingRequest) && (
                            incomingRequest ? (
                                <AcceptRejectBtn request={incomingRequest}
                                    text1="Accept"
                                    text2="Reject"
                                    className2={styles.acceptButton}
                                    className3={styles.rejectButton}
                                    className1={styles.requestedButtonContainer}
                                    textStyle={styles.acceptButtonText}
                                    textStyle2={styles.rejectButtonText}
                                />
                            ) : outgoingRequest ? (
                                <RemoveRequest request={outgoingRequest}
                                    text="Request Added"
                                    className2={styles.addedButton}
                                    className3={styles.addedButtonText}
                                />
                            ) : (
                                <AddRequest user={user}
                                    text="Add Request"
                                    className1={styles.addButtonContainer}
                                    className2={styles.addButton}
                                    className3={styles.addButtonText}
                                />
                            )
                        )
                    )}
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    profileCardSection: {
        alignSelf: "center",
        width: "90%",
        marginLeft: rem(2),
        marginHorizontal: "2%",
        paddingVertical: rem(0.5),
        paddingHorizontal: rem(0.2),
        borderWidth: 2,
        borderBottomColor: "#1e1e1e"
    },
    privacyContainer: {
        marginVertical: rem(3),
        padding: rem(1)
    },
    privacyIcon: {
        width: 90,
        height: 90,
        alignSelf: "center",
    },
    privacyMessage: {
        marginTop: rem(2.2),
        fontSize: rem(1.7),
        fontWeight: "500",
        letterSpacing: 1,
        textAlign: "center",
        color: "#999",
    },
    requestContainer: {
        padding: rem(2),
        paddingBottom: rem(12),
        justifyContent: "center",
        alignSelf:"center",
        alignItems: "center",
        flexDirection: "column",
        gap: 20
    },
    acceptButton: {
        backgroundColor: "#fff",
        width: "100%",
        height: 43,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    acceptButtonText: {
        color: "#000",
        fontSize: rem(1.7),
        fontFamily: "Inter_700Bold"
    },
    rejectButton: {
        alignItems: "center",
        justifyContent: "center"
    },
    rejectButtonText: {
        color: "#f44336",
        fontSize: rem(1.7),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.08)
    },
    addButtonContainer: {
        height: rem(4),
        width: rem(22),
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    addButton: {
        backgroundColor: "#fff",
        width: "100%",
        height: "100%",
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    addButtonText: {
        fontSize: rem(1.5),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.06),
        color: "#000"
    },
    addedButton: {
        alignItems: "center",
        justifyContent: "center",
        height: rem(4.2),
        width: rem(22),
        backgroundColor: "#1e1e1e",
        borderRadius: 50,
    },
    addedButtonText: {
        fontSize: rem(1.5),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.06),
        color: "#3c89fb"
    },
    requestedButtonContainer: {
        width: rem(25),
        alignItems: "center",
        gap: rem(3.5),
        flexDirection: "column",
        justifyContent: "center",
    },
});

export default PrivateProfile;
