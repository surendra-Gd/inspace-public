import {Tabs} from "expo-router";
import SpaceHeader from "../../../../../components/layout/SpaceHeader";
import {SpaceTabBar} from "../../../../../components/layout/SpaceTabBar";

export default function _layout() {
    return (
        <Tabs
            tabBar={props => <SpaceTabBar {...props} />}
        >
            <Tabs.Screen name="home" options={{
                header: () => <SpaceHeader />,
                tabBarLabel: 'Home'
            }} />
            <Tabs.Screen name="text" options={{
                header: () => <SpaceHeader />,
                tabBarLabel: 'Text'
            }} />
            <Tabs.Screen name="yourpage" options={{
                header: () => <SpaceHeader />,
                tabBarLabel: 'Your Page'
            }} />
        </Tabs>
    )
}