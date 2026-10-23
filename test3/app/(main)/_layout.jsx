import {Stack} from "expo-router";
import SecondaryHeader from "../../components/layout/SecondaryHeader";
import React from "react";
import PrivateScreen from "../PrivateScreen";
import AccountHeader from "../../components/layout/AccountHeader";

const Layout = () => {


    return (
        <PrivateScreen>
            <Stack>
                <Stack.Screen name="(tabs)" options={{
                    headerShown: false
                }} />
                <Stack.Screen name="joinspace" options={{
                    header: () => <SecondaryHeader title={"Join Space"} />
                }} />
                <Stack.Screen name="createspace" options={{
                    header: () => <SecondaryHeader />,
                }} />
                <Stack.Screen name="profile/[username]" options={({ route }) => {
                    const { username } = route.params || {};
                    return {
                        header: () => <SecondaryHeader title={username} />,
                    };
                }} />
                <Stack.Screen name="space/[spaceid]" options={{
                    headerShown: false
                }} />
                <Stack.Screen name="settings" options={{
                    header: () => <SecondaryHeader title={"Settings"}/>,
                }} />
                <Stack.Screen name="changepassword" options={{
                    header: () => <SecondaryHeader />
                }} />
                <Stack.Screen name="editaccount" options={{
                    header: () => <SecondaryHeader title={"Edit Profile"} />
                }} />
                <Stack.Screen name="userfriends" options={{
                    header: () => <SecondaryHeader title={"Your Friends"}/>
                }} />
                <Stack.Screen name="changeemailvalidation" options={{
                    header: () => <SecondaryHeader />
                }} />
                <Stack.Screen name="access-denied" options={{
                    headerShown: false,
                }} />
                <Stack.Screen name="profile-bio" options={{
                    header: () => <SecondaryHeader title={"Profile Bio"} />
                }} />
                <Stack.Screen name="account" options={{
                    header: () => <AccountHeader />
                }} />
                <Stack.Screen name="change-email-verification" options={{
                    headerShown: false
                }} />
            </Stack>
        </PrivateScreen>
    )
}

export default Layout;