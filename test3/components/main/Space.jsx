import React, { Fragment, useEffect, useState } from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Image, Pressable} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import DeleteSpaceModal from '../modal/DeleteSpaceModal';
import {MEMBER_COUNT_ERROR} from "../../service/constants/userConstants";
import {getLoadingState} from "../../service/selectors/appSelectors";
import {SPACE_UPDATING} from "../../service/constants/appConstants";
import {getSpaceMembersCountAction} from "../../service/actions/userActions";
import {useRouter} from "expo-router";
import {rem} from "../../utils/uiUtils";
import EditSpace from "./EditSpace";
import {setCurrentSpaceIdAction} from "../../service/actions/spaceActions";

const Space = ({ userSpace }) => {
    const { spacename, uniqueId, admin, spaceId, members } = userSpace;
    const dispatch = useDispatch();
    const router = useRouter();

    const [membersLoading, setMembersLoading] = useState(false);
    const [edit, setEdit] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const { errors } = useSelector(state => state.app);
    const memberCountError = errors[spaceId]?.error === MEMBER_COUNT_ERROR || false;
    const updating = useSelector(state => getLoadingState(state, spaceId, SPACE_UPDATING));

    useEffect(() => {
        if (!admin || memberCountError) return;
        setMembersLoading(true);
        dispatch(getSpaceMembersCountAction(spaceId)).finally(
            () => setMembersLoading(false)
        );
    }, [dispatch, spaceId, admin]);


    const handleNavigateToInsideSpace = async () => {
        if (edit) return;
        try {
            await dispatch(setCurrentSpaceIdAction(spaceId));
        } finally {
            router.push({
                pathname: "/space/[spaceid]/home",
                params: {spaceid: spaceId}
            });
        }
    };

    return (
        <>
            <Pressable style={styles.cardContainer} onPress={handleNavigateToInsideSpace}>
                <View>
                    <Text style={styles.spaceName}>{spacename}</Text>
                    <Text style={styles.spaceId}>{uniqueId}</Text>
                </View>
                <View style={styles.actionsContainer}>
                    {admin && (
                        <TouchableOpacity onPress={() => setEdit(true)}
                            style={styles.editIcon}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : (
                                <Image source={require("../../assets/images/pen.png")} style={{width: 22, height: 22}} />
                            )}
                        </TouchableOpacity>
                    )}

                    {membersLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : memberCountError ? (
                        <View style={styles.errorIcon}>
                            <Image source={require("../../assets/images/warning.png")} style={{width: 20, height: 20}} />
                            <Text style={styles.errorTxt}>Error</Text>
                        </View>
                    ) : (
                        members === 1 && admin && (
                            <TouchableOpacity onPress={() => setModalOpen(true)}
                                disabled={modalOpen}
                                style={styles.deleteIcon}
                            >
                                <Image source={require("../../assets/images/delete (4).png")} style={{width: 24, height: 24}} />
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </Pressable>

            {modalOpen && (
                <DeleteSpaceModal onClose={() => setModalOpen(false)}
                    spaceId={spaceId}
                    dispatch={dispatch}
                />
            )}

            {edit && (
                <EditSpace spaceId={spaceId}
                    spacename={spacename}
                    isEdit={edit}
                    onSuccess={() => setEdit(false)}
                    onClose={() => setEdit(false)}
                />
            )}

        </>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-evenly",
        paddingVertical: rem(2.5),
        backgroundColor: "#000",
        borderWidth: 2,
        borderColor: "#1e1e1e",
        borderRadius: 15,
        marginHorizontal: 1,
        borderCurve: "continuous",
        marginBottom: rem(2),
    },
    spaceId: {
        textAlign: "center",
        fontSize: rem(1.5),
        fontFamily: "Inter_600SemiBold",
        color: '#6f6f6f',
        marginBottom: rem(1.5),
    },
    spaceName: {
        fontSize: rem(1.8),
        color: '#fff',
        fontFamily: "Inter_700Bold",
        marginBottom: rem(0.5)
    },
    actionsContainer: {
        position: "absolute",
        right: "5%",
        bottom: "10%",
        flexDirection: "row",
        gap: rem(1)
    },
    editIcon: {
        paddingVertical: rem(0.5),
        paddingHorizontal: rem(0.5),
        justifyContent: "center",
        alignItems: "center"
    },
    deleteIcon: {
        paddingVertical: rem(0.5),
        paddingHorizontal: rem(0.5),
        justifyContent: "center",
        alignItems: "center"
    },
    errorTxt: {
        fontFamily: "Inter_700Bold",
        fontSize: rem(1),
        color: "red"
    },
    errorIcon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Space;