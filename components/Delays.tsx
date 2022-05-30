// Pick.tsx
import { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Button, Text } from 'react-native';
import MapView from 'react-native-maps';
import { Marker, Callout } from "react-native-maps";
import * as Location from 'expo-location';
import TrafficModel from '../models/traffic.ts';
import distanceBetweenCoordinates from '../models/distance';
import { Forms } from '../styles/index.js';
import getCoordinates from "../models/nominatim";
import strToCoords from '../models/stringToCoordinate.ts';
import DelayList from './DelaysList.tsx';
import Delay from './Delay.tsx';

export default function Delays({ route, navigation, currentGPSLocation, setCurrentGPSLocation }) {
    <View style={Base.base}>
    <Text style={Typography.header}>ORDERLISTA</Text>
    <Stack.Navigator initialRouteName="List">
        <Stack.Screen name="Map" {...screenProps} currentGPSLocation={props.currentGPSLocation} setCurrentGPSLocation={props.setCurrentGPSLocation} options={{headerShown: false}} component={DelayList} />
        <Stack.Screen name="Delays">
            {(screenProps) => <Delay {...screenProps} setProducts={props.setProducts} />}
        </Stack.Screen>
    </Stack.Navigator>
</View>
}
