import React, {useEffect, useMemo, useState} from "react";
import {ScrollView, ActivityIndicator} from 'react-native';
import {useDispatch, useSelector} from "react-redux";
import {getFeedAction} from "../../service/actions/spaceActions";
import {getCurrentSpace, selectPostsBySpaceAndToday, selectSpaceMembers} from "../../service/selectors/spaceSelectors";
import Post from './Post';
import {useRouter} from "expo-router";
import {DateBanner} from "../shared/DateBanner";
import {rem} from "../../utils/uiUtils";
import NoPost from "./NoPost";

const Feed = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const {isFeedFetched, spaceId, currentMember} = useSelector(getCurrentSpace);

    const feed = useSelector(selectPostsBySpaceAndToday);
    const members = useSelector(selectSpaceMembers);

    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchFeed = async () => {
            if (!isFeedFetched) {
                try {
                    setLoading(true);
                    await dispatch(getFeedAction(spaceId));
                } catch (err) {
                    console.log("error on fetching feed!");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchFeed().finally(() => setLoading(false));
    }, [dispatch, spaceId, feed]);

    const unPostedMembers = useMemo(() => {
        const postedMembers = feed?.map(post => post?.memberId) || [];
        return members.filter(member => !postedMembers.includes(member.memberId)) || [];
    }, [feed, members]);

    if (loading) return <ActivityIndicator size={"small"} color={"#6f6f6f"}/>;

    return (
        <ScrollView style={{
            top: rem(3.6),
            paddingBottom: rem(10)
        }}>
            <DateBanner/>
            {(isFeedFetched && feed.length > 0) && feed.map((post, idx) => (
                <Post currentMember={currentMember}
                      post={post}
                      key={idx}
                      router={router}
                      dispatch={dispatch}
                />
            ))}

            {unPostedMembers.length > 0 && unPostedMembers.map((member, idx) => (
                <NoPost currentMemberId={currentMember.memberId}
                        member={member}
                        router={router}
                        key={idx}
                />
            ))}
        </ScrollView>
    );
};

export default Feed;