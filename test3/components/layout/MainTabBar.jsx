import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {rem} from "../../utils/uiUtils";

export const MainTabBar = ({ state, descriptors, navigation}) => {

    const primaryColor = "#fff";
    const secondaryColor = "#505050";

    const icons = {
        index : () => <Image source={require("../../assets/images/index-i.png")} style={{width: 28, height: 28}}/>,
        spaces: () => <Image source={require("../../assets/images/rows.png")} style={{width: 28, height: 28 }} resizeMode="contain" />
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

                if(["_sitemap", "+not-found"].includes(route.name)) return null;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if(!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                }

                const onLongPress = () => {
                    navigation.emit({
                        type: "tabLongPress",
                        target: route.key
                    })
                }

                return (
                    <TouchableOpacity key={route.name}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={styles.tabBarItem}
                    >
                        {
                            icons[route.name]({
                                color: isFocused ? primaryColor : secondaryColor
                            })
                        }
                        <Text style={[styles.text, { color: isFocused ? primaryColor : secondaryColor }]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    tabBar: {
        position: "absolute",
        bottom: 0,
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "rgba(0,0,0, 0.96)",
        width: "100%",
        alignSelf: "center",
        paddingVertical: 8,
        borderTopStartRadius: 25,
        borderTopEndRadius: 25,
        borderCurve: "continuous",
    },
    tabBarItem: {
        justifyContent: "center",
        alignItems: "center",
        gap: 4
    },
    text: {
        fontFamily: "Inter_700Bold",
        letterSpacing: rem(0.02),
        fontSize: 12
    }
})