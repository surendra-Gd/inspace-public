import * as ImageManipulator from 'expo-image-manipulator';
import Toast from "react-native-toast-message";

// Compression options
const compressionOptions = {
    maxSize: 1920,       // Resize the longest side to a max of 1920 pixels if exceeded
    quality: 0.80,       // High quality to retain detail
};

// Compress Image Function
export const compressImage = async (uri, width, height) => {
    try {
        // Determine if resizing is necessary
        let resizeOptions = null;
        if (width > compressionOptions.maxSize || height > compressionOptions.maxSize) {
            // Resize to maxSize while maintaining aspect ratio
            resizeOptions =
                width > height
                    ? { width: compressionOptions.maxSize }
                    : { height: compressionOptions.maxSize };
        }

        // Perform compression with conditional resizing
        const compressedImage = await ImageManipulator.manipulateAsync(
            uri,
            resizeOptions ? [{ resize: resizeOptions }] : [],
            {
                compress: compressionOptions.quality,
                format: ImageManipulator.SaveFormat.JPEG,
            }
        );

        // Check file size in MB to ensure it’s not too large
        const response = await fetch(compressedImage.uri);
        const blob = await response.blob();
        const fileSizeInMB = blob.size / (1024 * 1024);

        if (fileSizeInMB > 3) {
            Toast.show({type:"error", text1: "Error: Image exceeds limit."})
            return null;
        }

        return {compressedImage, blob};
    } catch (error) {
        console.error("Image compression failed:", error);
        return null;
    }
};

// Enforce Aspect Ratio Function
export const enforceAspectRatio = (width, height) => {
    const aspectRatio = width / height;
    let result;

    if (aspectRatio === 1) {
        result = "1 / 1";
    } else if (aspectRatio.toFixed(2) === (4 / 5).toFixed(2)) {
        result = "4 / 5";
    } else if (aspectRatio.toFixed(2) === (4 / 3).toFixed(2)) {
        result = "4 / 3";
    } else {
        result = "3 / 4";
    }

    return result;
};