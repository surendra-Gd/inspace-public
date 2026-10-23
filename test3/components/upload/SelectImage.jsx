
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import UploadPost from "./UploadPost";
import { compressImage, enforceAspectRatio } from "../../utils/imageUtils";
import {rem} from "../../utils/uiUtils";
import Toast from "react-native-toast-message";

export const SelectImage = ({ count }) => {
    const [imageURI, setImageURI] = useState(null);
    const [blob, setBlob] = useState(null);
    const [aspectRatio, setAspectRatio] = useState("1");
    const [mode, setMode] = useState("photo");
    const [loading, setLoading] = useState(false);

    const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];

    const handleSelectImage = async () => {
        let result;
        if (mode === "photo") {
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                allowsEditing: true,
            });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                allowsEditing: true,
            });
        }

        if (result.canceled) {
            Toast.show({type: "error", text1: "Image is not valid."})
            return;
        }

        const file = result.assets[0];

        if (!validImageTypes.includes(file.mimeType)) {
            Toast.show({type:"error", text1:"Invalid file type. Only JPG and PNG are allowed."});
            return;
        }
        setLoading(true);
        try {
            const {compressedImage, blob} = await compressImage(file.uri, file.width, file.height);
            if (!compressedImage || !blob) {
                Toast.show({type:"error", text1: "Image may be corrupted."})
                return;
            }
            setAspectRatio(enforceAspectRatio(compressedImage.width, compressedImage.height));
            setBlob(blob);
            setImageURI(compressedImage.uri);
        } catch (error) {
            Toast.show({type:"error", text1: "Something went wrong during image processing. Please try again later."})
        } finally {
            setLoading(false);
        }
    };

    if (imageURI && blob) {
        return (
            <UploadPost blob={blob} uri={imageURI}
                onBack={() => setImageURI(null)}
                aspectRatio={aspectRatio}
            />
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Add Post</Text>
            <View style={styles.imageContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <TouchableOpacity onPress={handleSelectImage} style={styles.fileUploadButton}>
                        <Text style={styles.buttonText}>{mode === "photo" ? "Open Camera" : "Choose Photo"}</Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.postLimitMessage}>
                    You have <Text style={styles.highlight}>{3 - count} posts</Text> remaining for today!
                </Text>
            </View>
            <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => setMode("photo")} style={[styles.iconButton, mode === "photo" && styles.iconSelected]}>
                    <Image source={require("../../assets/images/camera.png")} style={{width: 40, height: 40}} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMode("gallery")} style={[styles.iconButton, mode === "gallery" && styles.iconSelected]}>
                    <Image source={require("../../assets/images/gallery.png")} style={{width: 40, height: 40}} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        top: rem(4.5)
    },
    heading: {
        fontSize: rem(2.4),
        fontFamily: "Inter_700Bold",
        left: rem(2),
        marginTop: rem(2.5),
        marginBottom: rem(1.7),
        color: "#dfd0d0"
    },
    imageContainer: {
        width: "96%",
        backgroundColor: "rgba(4,4,4,0.72)",
        aspectRatio: "3/4",
        alignSelf: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgb(6,6,6)",
        gap: 10
    },
    fileUploadButton: {
        marginTop: "40%",
        paddingVertical: 12,
        paddingHorizontal: 26,
        backgroundColor: "#007BFFFF",
        borderRadius: 25,
    },
    buttonText: {
        color: "#000",
        fontSize: rem(1.5),
        fontFamily: "Inter_800ExtraBold"
    },
    postLimitMessage: {
        textAlign: "center",
        fontSize: rem(1.4),
        fontFamily: "Inter_500Medium",
        color: "red",
        letterSpacing: rem(0.04)
    },
    highlight: {
        fontFamily: "Inter_800ExtraBold"
    },
    iconContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: "14%",
        gap: rem(11)
    },
    iconButton: {
        padding: "4%",
        backgroundColor: "#000",
        marginHorizontal: 10,
        borderRadius: 50,
    },
    iconSelected: {
        backgroundColor: "rgba(30,30,30,0.82)",
    },
});