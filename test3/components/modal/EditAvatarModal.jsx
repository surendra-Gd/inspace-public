import {Text, TouchableOpacity, View, StyleSheet, ActivityIndicator, Image, Dimensions, Modal} from "react-native";
import React, {useState} from "react";
import * as ImagePicker from "expo-image-picker";
import {compressImage} from "../../utils/imageUtils";
import {rem} from "../../utils/uiUtils";
import {API} from "../../service/api/utils";
import Toast from "react-native-toast-message";
import {UPDATE_USER_DATA} from "../../service/constants/authConstants";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function EditAvatarModal({user, dispatch, isVisible, onClose}) {
    const [loading, setLoading] = useState(false);
    const [imageURI, setImageURI] = useState("");
    const [blob, setBlob] = useState(null);

    const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];

    const handleSelectImage = async (mode) => {
        let result;
        if (mode === "photo") {
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                allowsEditing: true,
                aspect: [1, 1]
            });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                allowsEditing: true,
                aspect: [1, 1]
            });
        }

        if (result.canceled) {
            Toast.show({type: "error", text1: "Image is not valid."})
            return;
        }

        const file = result.assets[0];

        if (!validImageTypes.includes(file.mimeType)) {  // Here we check MIME type
            Toast.show({type: "error", text1: "Invalid file type. Only JPG and PNG are allowed."});
            return;
        }
        setLoading(true);
        try {
            const {compressedImage, blob} = await compressImage(file.uri, file.width, file.height);
            if (!compressedImage || !blob) {
                Toast.show({type: "error", text1: "Image may be corrupted."});
                return;
            }

            setBlob(blob);
            setImageURI(compressedImage.uri);
        } catch (error) {
            Toast.show({type: "error", text1: "Something went wrong during image processing. Please try again later."});
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append("file", {
            uri: imageURI,
            name: blob._data.name || 'uploaded_image.jpg',
            type: blob._data.type || 'image/jpeg',
        });

        try {
            const res = await API.put("/users/avatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            // Note: Again don't touch this
            dispatch({
                type: UPDATE_USER_DATA,
                payload: { user: { ...user, profile: res?.data } }
            });
            setImageURI("");
            setBlob("");
            onClose();
        } catch (error) {
            Toast.show({type: "error", text1: "Failed to update the avatar. Please try again later."});
        } finally {
            setLoading(false);
        }
    };

    if(imageURI) {
        return (
            <View style={styles.imageContainer}>
                <Image source={{ uri: imageURI }} style={styles.image} resizeMode={"contain"} />
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.action} onPress={() => setImageURI(null)} disabled={loading}>
                        <Text style={styles.actionText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.action} onPress={handleSubmit} disabled={loading}>
                        <Text style={styles.actionText}>{loading ? "Changing" : "Done"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }


    return (
        <Modal visible={isVisible} transparent={true} onRequestClose={() => onClose()} animationType={"slide"}>
            <View style={styles.modal}>
                <View style={styles.container}>
                <TouchableOpacity style={styles.cancel} onPress={() => onClose()}>
                    <Image source={require("../../assets/images/cancel (1).png")} style={{width:23, height:23}}/>
                </TouchableOpacity>
                <Text style={styles.heading}>Choose where to upload your image from:</Text>
                <TouchableOpacity onPress={() => handleSelectImage("photo")} style={styles.links}>
                    <Text style={styles.buttonText}>Take a Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSelectImage("gallery")} style={styles.links}>
                    <Text style={styles.buttonText}>From Gallery</Text>
                </TouchableOpacity>
            </View>
                {loading && (
                    <ActivityIndicator size="large" color="#fff" />
                )}
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.96)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    container: {
        position: "absolute",
        alignSelf: "center",
        top: rem(20),
        width: "94%",
        height: rem(23),
        borderWidth: 1,
        borderColor: "#1e1e1e",
        borderRadius: 15,
        borderCurve: "continuous",
        gap: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    cancel: {
        position: "absolute",
        top: 10,
        right: 12,
    },
    heading: {
        color: "#fff",
        fontSize: rem(1.4),
        paddingHorizontal: rem(1.2),
        marginVertical: rem(1),
        fontFamily: "Inter_700Bold"
    },
    links: {
        backgroundColor: "#6f6f6f",
        paddingVertical: rem(0.5),
        paddingHorizontal: rem(2),
        borderRadius: 10,
    },
    buttonText: {
        color: "#000",
        fontSize: rem(1.5),
        fontFamily: "Inter_700Bold"
    },
    imageContainer: {
        position: "absolute",
        zIndex: 1000,
        height: screenHeight,
        width: screenWidth,
        backgroundColor: "#000",
    },
    image: {
        width: "100%",
        aspectRatio: "1/1",
        backgroundColor: "#fff",
        alignSelf: "center",
        top: "20%",
        borderWidth: 0.7,
        borderColor: "#1e1e1e"
    },
    actions: {
        position: "absolute",
        bottom: rem(8),
        flexDirection: "row",
        justifyContent: "center",
        alignSelf: "center",
        gap: rem(10),
    },
    action: {
        paddingVertical: rem(1),
        paddingHorizontal: rem(1)
    },
    actionText: {
        fontSize: rem(1.6),
        fontFamily: "Inter_800ExtraBold",
        color: "#fff",
        letterSpacing: rem(0.03)
    }

})