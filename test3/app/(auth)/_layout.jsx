import {Stack} from "expo-router";
import SecondaryHeader from "../../components/layout/SecondaryHeader";
import PublicScreen from "../PublicScreen";


const AuthLayout = () => {

    return (
        <PublicScreen>
            <Stack>
                <Stack.Screen name="login" options={{
                    headerShown: false
                }} />
                <Stack.Screen name="sign-up" options={{
                    headerShown: false
                }} />
                <Stack.Screen name="signup-verification" options={{
                    headerShown: false
                }} />
                <Stack.Screen name="forget-password-email" options={{
                    header: () => <SecondaryHeader />
                }} />
                <Stack.Screen name="forget-password-verification" options={{
                    header: () => <SecondaryHeader />
                }} />
            </Stack>
        </PublicScreen>
    )
}

export default AuthLayout;