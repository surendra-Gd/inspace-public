import { lazy, memo, Suspense, useState, useEffect } from "react";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";

const PostView = lazy(() => import("./PostView"));
// const MemoizedPostView = memo(PostView);

// Todo: do it later.
const ImageSlider = ({ posts, currentMemberId, spaceId }) => {
    const [postIndex, setPostIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    const showNextPost = () => {
        setNextIndex((index) => (postIndex === posts.length - 1 ? 0 : postIndex + 1));
        setIsLoading(true);
    };

    const showPrevPost = () => {
        setNextIndex((index) => (postIndex === 0 ? posts.length - 1 : postIndex - 1));
        setIsLoading(true);
    };

    useEffect(() => {
        if (nextIndex !== null) {
            // Simulate the loading time for suspense
            const timer = setTimeout(() => {
                setPostIndex(nextIndex);
                setNextIndex(null);
                setIsLoading(false);
            }, 100); // Adjust the delay as needed

            return () => clearTimeout(timer);
        }
    }, [nextIndex]);



    return (
        <>
            {isLoading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size={"large"} color={"#fff"} />
                </View>
            )}
            <Suspense fallback={<Text style={{color: "#3c89fb"}}>Fetching your post... Just a sec! 😊</Text>}>
                <PostView
                    key={posts[postIndex]}
                    prev={showPrevPost}
                    next={showNextPost}
                    postId={Number(posts[postIndex])}
                    currentMemberId={currentMemberId}
                    spaceId={spaceId}
                />
            </Suspense>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        zIndex: 1000,
        alignSelf: "center",
        width: "100%",
        height: "100%"
    },
});

export default ImageSlider;