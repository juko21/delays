// auth/Auth.tsx

import authModel from '../../models/auth.ts';
import { View, Button } from "react-native";

export default function Logout( props ) {

    async function logout() {
        authModel.logout();
        props.setIsLoggedIn(false);
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="Logga ut" onPress={() => logout()} />
        </View>
    );
};