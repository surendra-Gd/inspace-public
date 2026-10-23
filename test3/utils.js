import {Text, TouchableOpacity, View} from "react-native";
import {getStore} from "./service/store";
import moment from "moment/moment";



export const emojisInput = {
    LOVE: '😍', SMILE: '😁', LIKE: '👍', LAUGH_TEAR: '🤣', SLEEPY: '😴'
}

export const memberPostsLists = async (lastPost, memberId) => {
    const memberPosts = [];

    const store = await getStore();
    const {posts} = store?.getState()?.post || {};

    const lastPostDate = new Date(lastPost);
    lastPostDate.setHours(0, 0, 0, 0);

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (currentDate; currentDate >= lastPostDate; currentDate.setDate(currentDate.getDate() - 1)) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const day = currentDate.getDate();

        const date = year + "-" + (month < 9 ? '0' : '') + (month + 1) + "-" + (day < 10 ? '0' : '') + day;
        let yearMonth = formDate(date);
        const postIds = getPostIdsByDateAndMemberId(date, memberId, posts);

        const isMonthExists = memberPosts.some(obj => obj.month === yearMonth);
        if(!isMonthExists) {
            let obj = {
                month: yearMonth,
                posts: [{date, postIds, isEmpty: !postIds.length }]
            }
            memberPosts.push(obj);
        } else {
            let obj = memberPosts.find(obj => obj.month === yearMonth);
            let postExists = obj.posts.some(p => p.date === date);
            if(!postExists) {
                obj.posts.push({date, postIds, isEmpty: !postIds.length })
            }
        }

    }
    return memberPosts;
}


export const groupPostsByMonthAndDate = (memberPost) => {
    if (!Array.isArray(memberPost) || memberPost.length === 0) return []; // Handle edge case

    const groupedByMonth = []; // Final grouped structure
    let lastMonth = ""; // Track the last processed month
    let currentMonthGroup = null; // Holds the current month group

    memberPost.forEach((post) => {
        const currentMonth = moment(post.sharedOn).format("MMMM YYYY");
        const currentDate = moment(post.sharedOn).format("YYYY-MM-DD");

        // Handle a new month
        if (currentMonth !== lastMonth) {
            // If there's an existing month group, push it to the groupedByMonth array
            if (currentMonthGroup) {
                groupedByMonth.push(currentMonthGroup);
            }

            // Create a new month group
            currentMonthGroup = {
                id: currentMonth,
                month: currentMonth,
                posts: [] // Will hold groups of posts for this month
            };

            lastMonth = currentMonth; // Update last processed month
        }

        // Check if the current date group already exists in the currentMonthGroup
        const existingDateGroup = currentMonthGroup.posts.find(
            (dateGroup) => dateGroup.id === currentDate
        );

        if (existingDateGroup) {
            // Add the post to the existing date group
            existingDateGroup.posts.push(post);
        } else {
            // Create a new date group for the current date
            currentMonthGroup.posts.push({
                id: currentDate,
                date: currentDate,
                posts: [post]
            });
        }
    });

    // Push the last accumulated month group
    if (currentMonthGroup) {
        groupedByMonth.push(currentMonthGroup);
    }

    return groupedByMonth;
};



const getPostIdsByDateAndMemberId = (date, memberId,  posts) => {
    let postIdsList = [];
    const numericMemberId = Number(memberId);
    for (let id in posts) {
        const post = posts[id];
        if(post?.sharedOn.substring(0,10) === date && post?.memberId===numericMemberId) {
            postIdsList.push(id);
        }
    }
    return postIdsList;
}

export const showOnlyPosts = (postsObj) => {
    return postsObj.map(obj => {
        const nonEmptyPosts = obj.posts.filter(post => !post.isEmpty)
        if(nonEmptyPosts.length === 0) return null;
        return {
            month: obj.month,
            posts: nonEmptyPosts
        }
    }).filter(obj => obj !== null)
}


function formDate(dateString) {
    let date = new Date(dateString);
    let options = { month: 'long', year: 'numeric' };

    return date.toLocaleDateString('en-US', options);
}

export const isSharedToday = (sharedOn) => {
    const sharedDate = new Date(sharedOn);
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));
    return sharedDate >= startOfToday && sharedDate <= endOfToday;
};


// TODO: Better emoji names
export const useDisplayEmojis = ({ showEmojis, setShowEmojis, onChange, styles }) => {

    if(showEmojis) {
        return (
            <View style={styles.emojisList}>
                <TouchableOpacity onPress={() => onChange("SLEEPY")} style={styles.emojiBtn}>
                    <Text style={styles.emojiText}>😴</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChange("LIKE")} style={styles.emojiBtn}>
                    <Text style={styles.emojiText}>👍</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChange("LAUGH_TEAR")} style={styles.emojiBtn}>
                    <Text style={styles.emojiText}>🤣</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChange("LOVE")} style={styles.emojiBtn}>
                    <Text style={styles.emojiText}>😍</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChange("SMILE")} style={styles.emojiBtn}>
                    <Text style={styles.emojiText}>😁</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowEmojis(false)} style={[styles.emojiBtn, {borderRadius: 50, aspectRatio : "1/1"}]}>
                    <Text style={styles.cancelBtn}></Text>
                </TouchableOpacity>
            </View>
        )
    } else {
        return (
            <TouchableOpacity onPress={() => setShowEmojis(true)} style={styles.emojiBtn}>
                <Text style={styles.emojiText}>😊</Text>
            </TouchableOpacity>
        )
    }
}

export const useFilterPostEmojiByType = (type, postEmojis) => {
    const filter = postEmojis?.filter(emoji => emoji.emojis === type);
    if(filter?.length === 0)
        return [];
    return filter;
}