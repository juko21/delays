// auth/Auth.tsx

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './Login.tsx';
import Register from './Register.tsx';

const Stack = createNativeStackNavigator();

export default function Auth(props) {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen options={{headerShown: false}} name="Login">
                {(screenProps) => <Login {...screenProps} setIsLoggedIn={props.setIsLoggedIn} />}
            </Stack.Screen>
            <Stack.Screen options={{headerShown: false}} name="Register" component={Register} />
        </Stack.Navigator>
    );
};