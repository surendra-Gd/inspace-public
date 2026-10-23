import React, { memo, useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getSuggestedUsersAction, updateSuggestedUsers } from '../../service/actions/userActions';
import SuggestedUser from './SuggestedUser';
import FriendSuggestionModal from '../modal/FriendSuggestionModal';
import {rem} from "../../utils/uiUtils";

const AddFriend = () => {
    const dispatch = useDispatch();
    const { page, users } = useSelector(state => state.user)?.suggestedUsers || {};

    const [pageLoading, setPageLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchSuggestedUsers = async () => {
        if (!page || (page?.hasNext && !loading)) {
            setLoading(true);
            const fetchPage = page ? page.currentPage + 1 : 0;
            await dispatch(getSuggestedUsersAction(fetchPage));
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestedUsers().finally(() => {
            setPageLoading(false);
        });
        return () => {
            dispatch(updateSuggestedUsers());
        };
    }, []);

    useEffect(() => {
        if (users?.length === 0 && page?.hasNext && !loading) {
            fetchSuggestedUsers();
        }
    }, [users, page, loading]);

    const handleLoadMore = () => {
        if (page?.hasNext && !loading) {
            fetchSuggestedUsers();
        }
    };

    if (pageLoading) return <ActivityIndicator size="small" color="#6f6f6f" style={styles.loading} />;

    return (
        <View style={styles.container}>
            {(users?.length !== 0 || page?.hasNext)? (
                <FlatList data={users}
                    keyExtractor={(item, index) => `${item.userId}-${index}`}
                    renderItem={({ item }) => <SuggestedUser request={item} />}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loading ? <ActivityIndicator size="small" color="#6f6f6f" /> : null
                    } nestedScrollEnabled={true}
                />
            ) : (
                <View style={styles.noUsersContainer}>
                    <FriendSuggestionModal />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: rem(1.2),
        paddingBottom: rem(14)
    },
    noUsersContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    loading: {
        marginVertical: rem(2),
    },
});

export default memo(AddFriend);
