import React, {memo, useCallback, useState} from 'react';
import {Text, StyleSheet, Pressable, View, ActivityIndicator} from 'react-native';
import {usePathname, useRouter} from "expo-router";
import {postWidth, rem} from "../../utils/uiUtils";

import {Image} from "expo-image";
import moment from "moment";

const MemberPost = ({ posts }) => {
    const post = posts[0];
    const { sharedOn, image, memberId } = post || {};
    const router = useRouter();
    const pathname = usePathname();
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const formattedDate = moment(post?.sharedOn).format("DD");

    const postIds = posts.map(p => p.postId);

    // Handle navigation on press
    const handleNavigateToPost = useCallback(() => {
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length >= 2) {
            const basePath = segments.slice(0, 2).join('/');
            router.push({
                pathname: `/${basePath}/post/[postIds]`,
                params: { postIds: postIds.join(", ") }
            });
        }
    }, [pathname, router, post, memberId]);

    // Handle image error
    const handleError = useCallback(() => {
        setImageLoading(false);
        setImageError(true);
    }, []);

    return (
        <Pressable style={styles.postItem} onPress={handleNavigateToPost}>

            {(imageLoading && !imageError) && (
                <ActivityIndicator size={rem(1.6)} color="#d9d9d9" style={styles.imageLoading}/>
            )}

            {!imageError ? (
                <Image style={styles.postImage} source={{uri: image}} onLoad={() => setImageLoading(false)} onError={handleError} />
                ) : (
                <View style={styles.errorContainer}>
                    <Image source={require("../../assets/images/picture.png")} style={{width: 30, height: 30}} />
                </View>
            )}
            <Text style={styles.postDate}>
                {formattedDate}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    postItem: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        width: postWidth(),
        borderWidth: 1,
        borderColor: "#212121"
    },
    imageLoading: {
      position: "absolute",
      alignSelf: "center"
    },
    postImage: {
        width: "100%",
        aspectRatio: "1/1",
        borderRadius: 7,
    },
    errorContainer: {
        backgroundColor: "#1e1e1e",
        width: "100%",
        aspectRatio: "1/1",
        borderRadius: 7,
        borderCurve: "continuous",
        alignItems: "center",
        justifyContent: "center",
    },
    postDate: {
        position: "absolute",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        paddingVertical: rem(0.3),
        paddingHorizontal: rem(0.4),
        borderRadius: 20,
        fontSize: 8,
        fontFamily: "Inter_500Medium",
        textAlign: "center",
        bottom: 5,
        left: 5
    },
});

export default memo(MemberPost);