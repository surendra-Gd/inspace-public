import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Keyboard,
} from "react-native";
import { useSelector } from "react-redux";
import {selectUnseenMessageCountBySpaceId} from "../../service/selectors/spaceSelectors";

export const SpaceTabBar = ({ state, descriptors, navigation }) => {
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const primaryColor = "#fff";
    const secondaryColor = "#505050";

    const badges = useSelector(selectUnseenMessageCountBySpaceId);

    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            setIsKeyboardVisible(true);
        });

        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            setTimeout(() => {
                setIsKeyboardVisible(false); // Delay setting keyboard visible to true
            }, 300);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);



    if (isKeyboardVisible) {
        return null; // Hide the tab bar when the keyboard is visible
    }

    return (
        <View style={styles.tabBar}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                if (["_sitemap", "+not-found"].includes(route.name)) return null;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: "tabLongPress",
                        target: route.key,
                    });
                };

                return (
                    <TouchableOpacity
                        key={route.name}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={styles.tabBarItem}
                    >
                        {(badges > 0 && label === "Text") && (
                            <View style={styles.badgeContainer}>
                                {/*<Text style={styles.badgeText}></Text>*/}
                            </View>
                        )}
                        <Text
                            style={[
                                styles.text,
                                { color: isFocused ? primaryColor : secondaryColor },
                            ]}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: "absolute",
        bottom: 35,
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "rgba(0,0,0,1)",
        width: "80%",
        alignSelf: "center",
        paddingVertical: 8,
        borderRadius: 22,
        borderWidth: 1,
        borderCurve: "continuous",
    },
    tabBarItem: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    text: {
        fontFamily: "Inter_600SemiBold",
        letterSpacing: 0.03,
        fontSize: 15,
    },
    badgeContainer: {
        backgroundColor: "#ff2020",
        position: "absolute",
        top: -3,
        left: "100%",
        minHeight: 12,
        minWidth: 12,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 50,
        zIndex: 1000,
    },
    badgeText: {
        fontSize: 10,
        fontFamily: "Inter_600SemiBold",
    },
});