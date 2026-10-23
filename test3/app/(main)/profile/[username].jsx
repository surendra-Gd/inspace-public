import React, { useEffect, useState } from "react";
import {View, StyleSheet, ActivityIndicator, FlatList} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {PROFILE_ERROR} from "../../../service/constants/userConstants";
import {useLocalSearchParams, useRouter} from "expo-router";
import {getProfileAction} from "../../../service/actions/userActions";
import ErrorComponent from "../../../components/shared/ErrorComponent";
import PrivateProfile from "../../../components/profile/PrivateProfile";
import FriendProfile from "../../../components/profile/FriendProfile";
import {rem} from "../../../utils/uiUtils";


export default function ProfilePage() {
    const dispatch = useDispatch();
    const {username} = useLocalSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const { profiles } = useSelector(state => state.user) || [];
    const { errors } = useSelector(state => state.app);

    const profileError = errors[username]?.error === PROFILE_ERROR || false;

    useEffect(() => {
        if (profileError) return;
        setLoading(true);
        dispatch(getProfileAction(username, router))
            .then(() => setLoading(false));
    }, [username, dispatch]);

    const profile = profiles?.find(profile => profile?.user?.username === username);

    if (profileError) {
        return (
            <View style={styles.errorContainer}>
                <ErrorComponent msg="Something went wrong. Please try again later." />
            </View>
        );
    }

    return (
        <FlatList data={[]}
            renderItem={null}
            ListFooterComponent={
                loading ? (
                    <ActivityIndicator size={25} color={"#fff"} style={styles.loading}/>
                ) : (profile && (profile?.areFriends
                        ? <FriendProfile profile={profile} dispatch={dispatch} />
                        : <PrivateProfile profile={profile} dispatch={dispatch} />
                ))
            }
            showsVerticalScrollIndicator={false}
            style={styles.container}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#000",
        marginTop: rem(7),
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textStyle: {
        marginTop: 50,
        fontSize: 17,
        fontWeight: "500"
    },
    loading: {
        backgroundColor: "#000",
        marginTop: "80%",
        alignSelf: "center",
    }
});
