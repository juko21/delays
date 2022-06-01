// Pick.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ScrollView, StyleSheet, TextInput, Button, Text } from 'react-native';
import { Base } from '../styles/index.js';

import DelaysList from './DelaysList.tsx';
import Waiting from './Waiting.tsx';
const Stack = createNativeStackNavigator();

// Stack navigator for station details (with delay list)
// and "show me where I have time to walk"-mapview
export default function Delays({
    navigation, route,
    delays, setDelays,
    stations, setStations,
    favourites, setFavourites,
    isLoggedIn 
}) {
    return(
        <View style={ Base.container }>
        <Stack.Navigator   
            screenOptions={{headerShown: false}}
            initialRouteName='Search'>
            <Stack.Screen name="Search">
                {(screenProps) => <DelaysList 
                    {...screenProps}
                    name="Search"
                    options={{headerShown: false}}
                    delays={delays}
                    isLoggedIn={isLoggedIn}
                    setDelays={setDelays}
                    stations={stations}
                    setStations={setStations}
                    favourites={favourites}
                    setFavourites={setFavourites}
                    component={DelaysList} 
                />}
            </Stack.Screen>
            <Stack.Screen name="Waiting">
                {(screenProps) => <Waiting {...screenProps} />}
            </Stack.Screen>
        </Stack.Navigator>
        </View>
    );
}