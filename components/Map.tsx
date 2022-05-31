// Pick.tsx
import { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Pressable, Text, FlatList, TouchableOpacity} from 'react-native';
import MapView from 'react-native-maps';
import { Marker, Callout } from "react-native-maps";
import * as Location from 'expo-location';
import TrafficModel from '../models/traffic.ts';
import distanceBetweenCoordinates from '../models/distance';
import { Forms, MapStyle } from '../styles/index.js';
import getCoordinates from "../models/nominatim";
import strToCoords from '../models/stringToCoordinate.ts';
import { showMessage } from "react-native-flash-message";
import { Ionicons } from '@expo/vector-icons';

let firstRender = true;

export default function Home({ route, navigation, currentGPSLocation, setCurrentGPSLocation }) {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationMarker, setLocationMarker] = useState(null);
    const [searchLocation, setSearchLocation] =  useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [stations, setStations] = useState(null);
    const [delays, setDelays] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [delayedStations, setDelayedStations] = useState(null);
    const [delayMarkers, setDelayMarkers] = useState(null);
    const [matches, setMatches] = useState(null);
    const inputRef = useRef(null);
    const mapRef = useRef(null);

    function fitMarker() {
        if (currentLocation){
            setTimeout(() => {
                mapRef.current.animateToRegion({...currentLocation.coords, latitudeDelta: 0.01, longitudeDelta: 0.01}, 3000)
            }, 500)
        }
    }

    async function getMatches(searchString, set = false) {
        if(stations && delays) {
            const stationMatches = stations.filter((station) => { return station.AdvertisedLocationName.includes(searchString)})
            setMatches(stationMatches);
        }
    }

    async function onStationSelected(station) {
        setSearchLocation(station.AdvertisedLocationName);
        inputRef.current.setNativeProps({ text: station.AdvertisedLocationName })
        setSelectedStation(station);
        setMatches([]);
    }

    async function setCurrentLocationToUser() {
        const { status } = await Location.requestForegroundPermissionsAsync();
    
        if (status !== 'granted') {
            setErrorMessage('Permission to access location was denied');
            return;
        }

        const curLoc = await Location.getCurrentPositionAsync({});
        setCurrentLocation(curLoc);
        setLocationMarker(
        <Marker
            identifier='mp'
            coordinate={{
                latitude: curLoc.coords.latitude,
                longitude: curLoc.coords.longitude
            }}
            title="Min plats"
            pinColor="#0B924E"
        >
            <Callout>
                <View style={{alignSelf: 'center', padding: 12}}>
                    <Text>Min plats</Text>
                </View>
            </Callout>
        </Marker>
        );
    }

    async function goToSearch() {
        let stationMatch = selectedStation;
        if(!selectedStation) {
            stationMatch = stations.filter((station) => { return station.AdvertisedLocationName.includes(searchLocation)})[0];
            setMatches([]);
            if(stationMatch) {
                inputRef.current.setNativeProps({ text: stationMatch.AdvertisedLocationName })
                setSearchLocation(stationMatch.AdvertisedLocationName);
            }
        }
        if (!stationMatch) {
            showMessage({
                message: "Sökresultat",
                description: "Inga stationer hittades",
                type: "default",
            });
            return;
        }
        let searchMarker = null;
        if(delayMarkers) {
            searchMarker = delayMarkers.filter(delayMarker => { return delayMarker.key === stationMatch.LocationSignature})[0];
        }
        const curLoc = {coords: strToCoords(stationMatch.Geometry.WGS84)};
        if (!searchMarker) {
            searchMarker = (    
            <Marker
                identifier='mp'
                coordinate={{
                    latitude: curLoc.coords.latitude,
                    longitude: curLoc.coords.longitude
                }}
                pinColor="#0B924E"
            >
                <Callout onPress={()=>{goToScreen(stationMatch)}}>
                    <View style={{alignSelf: 'center', maxHeight: 300, padding: 12}}>
                        <Text>{stationMatch.AdvertisedLocationName + "\nInga förseningar"}</Text>
                    </View>
                </Callout>
            </Marker> 
            );
        }
        setCurrentLocation(curLoc);
        setLocationMarker(searchMarker);
        setSelectedStation(null);
    }

    function goToScreen(station) {
        navigation.navigate('Sök', {
            screen: 'Search',
            params: { passedStation: station }
        });
    }
    async function findDelays() {
        const listOfDelayStations = stations
        .filter((station) => {
            return delays.some((delay) => {
              return (delay.FromLocation ? delay.FromLocation[0].LocationName : null) === station.LocationSignature;
            });
          });
        setDelayedStations(listOfDelayStations);
        const delayedStationMarkers = listOfDelayStations
            .map((station, index) => {
                const curDelay = delays
                    .filter((delay) => { return (delay.FromLocation ? delay.FromLocation[0].LocationName : null) === station.LocationSignature; });
                let delayTitle = station.AdvertisedLocationName;
                curDelay.forEach(delay => {
                    let adTime = new Date(delay.AdvertisedTimeAtLocation);
                    adTime = adTime.getFullYear() + "/" + adTime.getMonth() + "/" + adTime.getDate() + " " + adTime.getHours() + ":" + String(adTime.getMinutes()).padStart(2, "0");
                    let estTime = new Date(delay.EstimatedTimeAtLocation);
                    estTime = estTime.getFullYear() + "/" + estTime.getMonth() + "/" + estTime.getDate() + " " + estTime.getHours() + ":" + String(estTime.getMinutes()).padStart(2, "0");
                    const options = { year: 'numeric', month: 'long', day: 'numeric', hour:'2-digit', minute: '2-digit' };
                    const arrival = stations.filter((stationInner) => { return (delay.ToLocation ? delay.ToLocation[0].LocationName : null) === stationInner.LocationSignature;});
                    delayTitle += "\nTåg från " + station.AdvertisedLocationName + " till " + arrival[0].AdvertisedLocationName + "\nAvgång kl: " + adTime.toLocaleString('sv-SE', options) + "\nNy beräknad avgångstid: " + estTime.toLocaleString('sv-SE', options) +"\n\n";
                });
                return <Marker
                coordinate={{
                    latitude: strToCoords(station.Geometry.WGS84).latitude,
                    longitude: strToCoords(station.Geometry.WGS84).longitude
                }}
                key={station.LocationSignature}
                title={delayTitle}
                pinColor="red"
                >
                <Callout onPress={()=>{goToScreen(station)}}>
                    <View style={{alignSelf: 'center', maxHeight: 300, padding: 12}}>
                        <Text>{delayTitle}</Text>
                    </View>
                </Callout>
                </Marker>; 
        });
        setDelayMarkers(delayedStationMarkers);
    }

    useEffect(() => {
        (async () => {
                const stationsList = await TrafficModel.getStations();
                const delaysList = await TrafficModel.getDelays();
                const status = await setCurrentLocationToUser();
                setStations(stationsList);
                setDelays(delaysList)
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if(stations && delays) {
                findDelays();
            }
        })();
    }, [stations, delays]);

    useEffect(() => {
        (async () => {
            fitMarker();
        })();
    }, [currentLocation]);

    return (
        <View style={MapStyle.container}>
            <View style={Forms.sidebyButtonSearch}>
                <TextInput
                    ref={inputRef}
                    style={{ ...Forms.input }}
                    onChangeText={(content: string) => {
                        setSearchLocation(content);
                        getMatches(content, true);
                    }}
                />
                <Pressable
                    style={({ pressed }) => [
                        {
                          backgroundColor: pressed ? '#F15B5B' : '#EE2A2A',
                        },
                        Forms.pressable,
                      ]}
                    onPress={() => {
                        goToSearch();
                    }}
                >
                    <Ionicons style={Forms.buttonText} name="search-outline"/>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [
                        {
                          backgroundColor: pressed ? '#F15B5B' : '#EE2A2A',
                        },
                        Forms.pressable,
                      ]}
                    onPress={() => {
                        setCurrentLocationToUser();
                    }}
                >
                    <Ionicons style={Forms.buttonText} name="locate-outline"/>
                </Pressable>
            </View>
            <MapView
                ref={mapRef}
                style={MapStyle.map}
                initialRegion={{ 
                    latitude: 56.1612,
                    longitude: 15.5869,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}>
                {locationMarker}
                {delayMarkers}
            </MapView>
            <FlatList
                style={Forms.dropdown}
                data={matches}
                renderItem={({item, index}) => (
                <TouchableOpacity style={Forms.dropdownListItem} onPress={() => onStationSelected(item)}>
                    <Text>{ item.AdvertisedLocationName }</Text>
                </TouchableOpacity>
                )}
                keyExtractor={item => item.LocationSignature}
            />
        </View>
    );
}

