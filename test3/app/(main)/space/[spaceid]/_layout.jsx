import { Stack } from "expo-router";
import InSpace from "../../../InSpace";
import {Platform} from "react-native";
import SecondarySpaceHeader from "../../../../components/layout/SecondarySpaceHeader";

const Layout = () => {
    return (
        <InSpace>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="activity" options={{ header: () => <SecondarySpaceHeader title={"Activity"}/> }} />
                <Stack.Screen name="members" options={{ header: () => <SecondarySpaceHeader title={"Members"} /> }} />
                <Stack.Screen name="leave" options={{ header: () => <SecondarySpaceHeader /> }} />

                <Stack.Screen
                    name="comment/[commentId]"
                    options={{
                        header: () => <SecondarySpaceHeader title={"Replies"} />
                    }}
                />

                <Stack.Screen name="post/[postIds]" options={{
                    header: () => <SecondarySpaceHeader />,
                    presentation: "modal",
                    gestureEnabled: true,
                    ...Platform.select({
                        android: {
                            animation: 'slide_from_bottom',
                        },
                    }),
                }} />

                <Stack.Screen name="text/[textId]" options={{
                    header: () => <SecondarySpaceHeader title={"Text"}/>,
                    presentation: "modal",
                    gestureEnabled: true,
                    ...Platform.select({
                        android: {
                            animation: 'slide_from_bottom',
                        },
                    }),
                }} />
                <Stack.Screen name="upload" options={{ header: () => <SecondarySpaceHeader /> }} />
            </Stack>
        </InSpace>
    );
};

export default Layout;
