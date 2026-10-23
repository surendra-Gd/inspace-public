import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView, Platform, Pressable
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addPostAction } from '../../service/actions/spaceActions';
import { getCurrentSpace } from '../../service/selectors/spaceSelectors';
import Toast from 'react-native-toast-message';
import {useRouter} from "expo-router";
import {rem} from "../../utils/uiUtils";

const UploadPost = ({ uri, blob, onBack }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(false);
    const captionRegex = /^(?!.*['";\\*]).{1,255}$/;

    const { currentMember, spaceId } = useSelector(getCurrentSpace);
    const memberId = currentMember?.memberId;

    const profile = currentMember?.user?.profile;

    const handleSubmit = async () => {
        if (caption && !captionRegex.test(caption)) {
            Toast.show({ type: 'error', text1: "Error: Caption contains invalid characters or exceeds 255 characters." });
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', {
            uri: uri,
            name: blob._data.name || 'uploaded_image.jpg',
            type: blob._data.type || 'image/jpeg',
        });
        formData.append('caption', caption);

        try {
            await dispatch(addPostAction(spaceId, memberId, formData, profile));
            router.back();
            setCaption('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={{ flex: 2 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.heading}>
                            Be real, no filters— This is your place to be yourself.
                        </Text>
                    </View>

                    <View style={styles.imageContainer}>
                        {uri && <Image source={{ uri: uri }} style={styles.image} />}
                    </View>

                    <View style={styles.expressionContainer}>
                        <TextInput style={styles.input}
                            placeholder="Photo Expression"
                            placeholderTextColor={"#d9d9d9"}
                            value={caption}
                            onChangeText={setCaption}
                        />
                        <Text style={styles.expressionMessage}>
                            Feel free to express your thoughts on this post.
                        </Text>
                    </View>

                    <View style={styles.shareContainer}>
                        <TouchableOpacity style={styles.shareButton}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : (
                                <Text style={styles.shareButtonText}>{loading ? "Sharing" : "Share"}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </ScrollView>
    );
};

export default UploadPost;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        top: rem(4),
        width: "100%"
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "space-between",
        overflow: "visible",
        gap: 3
    },
    heading: {
        marginRight: rem(2),
        fontSize: rem(1.9),
        fontFamily: "Inter_700Bold",
        left: rem(2),
        marginTop: rem(3),
        marginBottom: rem(1.7),
        color: "#dfd0d0"
    },
    imageContainer: {
        position: "relative",
        width: "96%",
        aspectRatio: "3/4",
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "#6f6f6f",
    },
    image: {
        width: '100%',
        height: "100%",
        resizeMode: 'contain',
    },
    expressionContainer: {
        marginVertical: rem(1.9),
        marginHorizontal: rem(1)
    },
    input: {
        borderWidth: 1,
        paddingVertical: rem(1),
        padding: rem(1.5),
        backgroundColor: "#1e1e1e",
        borderRadius: 18,
        color: "#dddddd",
        fontSize: rem(1.6),
        fontFamily: "Inter_500Medium",
        letterSpacing: rem(0.06),
        borderCurve: "continuous",
        marginBottom: 4,
    },
    expressionMessage: {
        color: '#3083FFFF',
        fontSize: rem(1.2),
        fontFamily: "Inter_700Bold",
        margin: rem(0.5),
        letterSpacing: rem(0.03)
    },
    shareContainer: {
        alignItems: 'center',
        marginTop: rem(1.7),
        marginBottom: rem(6),
        justifyContent: "flex-start",
    },
    cancelButton: {
        position: "absolute",
        zIndex: 1001,
        backgroundColor: '#fff',
    },
    cancelBtnTxt: {
        color: 'red',
        fontSize: rem(1.6),
        fontFamily: "Inter_800ExtraBold",
        letterSpacing: rem(0.03)
    },
    shareButton: {
        backgroundColor: '#fff',
        width: rem(20),
        height: rem(4.5),
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    shareButtonText: {
        color: '#000',
        fontSize: rem(1.6),
        fontFamily: "Inter_800ExtraBold",
        letterSpacing: rem(0.03)
    },
});