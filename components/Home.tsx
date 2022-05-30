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
import Map from './Map.tsx';
import { Base, Typography } from '../styles/index.js';

export default function Map({ route, navigation, props currentGPSLocation, setCurrentGPSLocation }) {
    return (
        <View style={Base.base}>

        </View>
    );
}
