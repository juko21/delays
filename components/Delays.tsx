// Pick.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ScrollView, StyleSheet, TextInput, Button, Text } from 'react-native';

import DelaysList from './DelaysList.tsx';
import Delay from './Delay.tsx';
const Stack = createNativeStackNavigator();

export default function Delays({ route, navigation }) {
    <View style={Base.base}>
    <Stack.Navigator>
        <Stack.Screen name="Search" {...screenProps} options={{headerShown: false}} component={DelaysList} />
        <Stack.Screen name="Waiting">
            {(screenProps) => <Delay {...screenProps} setProducts={props.setProducts} />}
        </Stack.Screen>
    </Stack.Navigator>
</View>
}
