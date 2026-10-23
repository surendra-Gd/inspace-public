import {Tabs} from "expo-router";
import MainHeader from "../../../components/layout/MainHeader";
import {MainTabBar} from "../../../components/layout/MainTabBar";


export default function MainLayout() {
    return (
        <Tabs
            tabBar={props => <MainTabBar {...props} />}
        >
            <Tabs.Screen name="index" options={{
                header: () => <MainHeader />,
                tabBarLabel: 'Explore',
            }} />
            <Tabs.Screen name="spaces" options={{
                header: () => <MainHeader />,
                tabBarLabel: 'Spaces'
            }} />
        </Tabs>
    )
}