// utils/fontSize.js
import { Dimensions } from 'react-native';

// Define your base font size in pixels (similar to the default 16px in web)
const BASE_FONT_SIZE = 10; // You can adjust this based on your design

// Function to convert rem to px
export const rem = (value) => {
    const { width } = Dimensions.get('window');
    const baseWidth = 375; // Reference width (e.g., width of an iPhone 6/7/8)
    const scale = width / baseWidth; // Calculate scale based on current width
    return value * BASE_FONT_SIZE * scale; // Return the equivalent size
};

export const postWidth = () => {
    const { width: screenWidth } = Dimensions.get('window');
    const containerPadding = 10; // Padding for the container
    const gap = 5; // Gap between posts
    const POSTS_PER_ROW = 3;

    return (screenWidth - containerPadding - gap * 2) / POSTS_PER_ROW;
}


export const calculateTextHeight = (groupMessage, contentWidth) => {
    // first get height of message then if prefix exists then check prefix also.
    let textContainer = contentWidth - 10;
    if(groupMessage?.prefixes) {
        textContainer -= 10;
    }
    const fontWidth = 15 * 0.25;
    const charactersPerLine = Math.floor(contentWidth / fontWidth);
    const totalLines = Math.ceil(groupMessage.message.length / charactersPerLine);

    // width screen * 0.7 - 30
    const lineHeight = 20 + 6 * 1.3;
    const messageLength =  (totalLines * lineHeight);
    let prefixLength = 0;

    if(groupMessage?.prefixes) {
        const fontWidth = 13 * 0.55;
        const charactersPerLine = Math.floor(contentWidth / fontWidth);
        const totalLines = Math.ceil(groupMessage?.prefixes?.length / charactersPerLine);

        // width screen * 0.7 - 30
        const lineHeight = 30 * 1.3;
        prefixLength =  (totalLines * lineHeight);
    }

    return messageLength + prefixLength + 6;
}