// Pick.tsx
import { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Pressable, Text, FlatList, TouchableOpacity} from 'react-native';
import MapView from 'react-native-maps';
import { Marker, Callout } from "react-native-maps";
import * as Location from 'expo-location';
import TrafficModel from '../models/traffic.ts';
import distanceBetweenCoordinates from '../models/distance';
import { Forms, ListStyle, MapStyle } from '../styles/index.js';
import getCoordinates from "../models/nominatim";
import strToCoords from '../models/stringToCoordinate.ts';
import { showMessage } from "react-native-flash-message";
import { Ionicons } from '@expo/vector-icons';

let firstRender = true;

export default function Home({ route, navigation }) {
    const [searchLocation, setSearchLocation] =  useState(null);
    const [errorMessage, setErrorMessage] = useState(null)
    const [delayMarker, setDelayMarker] = useState(null);
    const mapRef = useRef(null);
    const {waitingDelay, waitingStation, arrivalStation} = route.params;

    async function setMarker() {
        let adDate = new Date(waitingDelay.AdvertisedTimeAtLocation);
        let adTime = adDate.getHours() + ":" + String(adDate.getMinutes()).padStart(2, "0");
        let adDateStr = adDate.getFullYear() + "/" + adDate.getMonth() + "/" + adDate.getDate() + " " + adTime;
        let estDate = new Date(waitingDelay.EstimatedTimeAtLocation);
        let estTime = estDate.getHours() + ":" + String(estDate.getMinutes()).padStart(2, "0");
        let estDateStr = estDate.getFullYear() + "/" + estDate.getMonth() + "/" + estDate.getDate() + " " + estTime;
        let title = waitingStation.AdvertisedLocationName;
        let content = "Tåg till " + arrivalStation.AdvertisedLocationName + "\n"
        let content += "Avgångstid " + adDateStr + "\n";
        let content += "Ny beräknad avgångstid " + estDateStr + "\n";

        const marker = (
        <Marker
            coordinate={{
                latitude: strToCoords(waitingStation.Geometry.WGS84).latitude,
                longitude: strToCoords(waitingStation.Geometry.WGS84).longitude
            }}
            key={waitingStation.LocationSignature}
            title={}
            pinColor="red"
        >
        <Callout>
            <View style={{alignSelf: 'center', maxHeight: 300, padding: 12}}>
                <Text style={ListStyle.accordionItemTitle}>{title}</Text>
                <Text style={ListStyle.accordionItemPressable}>{content}</Text>
            </View>
        </Callout>
        </Marker>
        );
        setDelayMarker(marker);
    }

    useEffect(() => {
        (async () => {
            setMarker();
        })();
    }, []);

    useEffect(() => {
        (async () => {
            fitMarker(delayMarker);
        })();
    }, [delayMarker]);

    return (
        <View style={MapStyle.container}>
            <MapView
                ref={mapRef}
                style={MapStyle.map}
                initialRegion={{ 
                    latitude: strToCoords(waitingStation.Geometry.WGS84).latitude
                    longitude: longitude: strToCoords(waitingStation.Geometry.WGS84).longitude
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}>
                {delayMarker}
            </MapView>
        </View>
    );
}

