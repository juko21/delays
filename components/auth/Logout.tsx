// auth/Auth.tsx

import authModel from '../../models/auth.ts';
import { Text, View, Pressable } from "react-native";
import Header from '../Header.tsx';
import { AuthStyle} from '../../styles/index.js'

export default function Logout( props ) {

    async function logout() {
        authModel.logout();
        props.setIsLoggedIn(false);
    }

    return (
        <View>
            <Header
                title="Logga ut"
                navigation={props.navigation}
            />
            <View style={AuthStyle.container}>
                <Pressable
                    style={AuthStyle.pressable}
                    onPress={() => logout()} 
                >
                    <Text style={AuthStyle.pressableText}>Logga ut</Text>
                </Pressable>
            </View>
        </View>
    );
};