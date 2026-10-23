import React, { useState, Fragment } from 'react';
import {View, StyleSheet, Text, Pressable} from 'react-native';
import { useDispatch } from "react-redux";
import AvatarRemoveModal from "../modal/AvatarRemoveModal";
import EditAvatarModal from "../modal/EditAvatarModal";
import {rem} from "../../utils/uiUtils";
import ProfileImageViewer from "../shared/PostImageViewer";


const EditAvatar = ({ user }) => {
    const dispatch = useDispatch();
    const profile = user?.profile;
    const isDefault = profile?.includes("default_user_avatar.png");
    const [changeModalOpen, setChangeModalOpen] = useState(false);
    const [removeModalOpen, setRemoveModalOpen] = useState(false);


    return (
        <Fragment>
            <View style={styles.avatarEditor}>
                <View style={styles.avatarContainer}>
                    <ProfileImageViewer profilePic={profile} picStyle={styles.avatarImage} />
                </View>
                <View style={[styles.actionsContainer, isDefault ? styles.defaultProfile : null]}>
                    <Pressable style={styles.changeAction}
                        onPress={() => setChangeModalOpen(true)}
                        disabled={removeModalOpen || changeModalOpen}
                    >
                        <Text style={styles.actionText}>{(profile && !isDefault) ? "Change Avatar" : "Add Avatar"}</Text>
                    </Pressable>
                    {(profile && !isDefault) && (
                        <Pressable style={styles.removeAction}
                            onPress={() => setRemoveModalOpen(true)}
                            disabled={removeModalOpen || changeModalOpen}
                        >
                            <Text style={styles.actionText}>Remove</Text>
                        </Pressable>
                    )}
                </View>
            </View>
            {removeModalOpen && (
                <AvatarRemoveModal user={user}
                    dispatch={dispatch}
                    onClose={() => setRemoveModalOpen(false)}
                />
            )}
            {changeModalOpen && (
                <EditAvatarModal user={user}
                    dispatch={dispatch}
                    onClose={() => setChangeModalOpen(false)}
                    isVisible={changeModalOpen}
                />
            )}
        </Fragment>
    );
};

const styles = StyleSheet.create({
    avatarEditor: {
        marginTop: rem(1),
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
        gap: rem(0.5),
        marginHorizontal: rem(5),
    },
    avatarContainer: {
        width: 150,
        height: "auto"
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 25,
        objectFit: "cover",
    },
    defaultProfile: {
        alignSelf: "flex-start"
    },
    actionsContainer: {
        flexDirection: 'column',
        padding: rem(0.2),
        gap: rem(2)
    },
    changeAction: {
        backgroundColor: "#007BFFFF",
        paddingVertical: rem(0.7),
        paddingHorizontal: rem(1.9),
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    removeAction: {
        backgroundColor: "rgb(251,60,60)",
        paddingVertical: rem(0.7),
        paddingHorizontal: rem(1.9),
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    actionText: {
        fontSize: rem(1.4),
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.03)
    }
});

export default EditAvatar;
