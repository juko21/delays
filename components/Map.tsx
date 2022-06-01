// Pick.tsx
import { useState, useEffect, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, TextInput, Pressable, Text, FlatList, TouchableOpacity} from 'react-native';
import MapView from 'react-native-maps';
import { Marker, Callout } from "react-native-maps";
import * as Location from 'expo-location';
import TrafficModel from '../models/traffic.ts';
import distanceBetweenCoordinates from '../models/distance';
import { Base, Typography, Forms, MapStyle } from '../styles/index.js';
import getCoordinates from "../models/nominatim";
import strToCoords from '../models/stringToCoordinate.ts';
import { showMessage } from "react-native-flash-message";
import { Ionicons } from '@expo/vector-icons';
import DoubleHeader from './DoubleHeader.tsx';
import FavouriteModel from '../models/favourites.ts';
let firstRender = true;

export default function Map({
    route,
    navigation,
    isLoggedIn,
    stations, setStations,
    favourites, setFavourites,
    delays, setDelays 
}) {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationMarker, setLocationMarker] = useState(null);
    const [searchLocation, setSearchLocation] =  useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [currentStation, setCurrentStation] = useState(null);
    const [addToFavoritesButton, setAddToFavoritesButton] = useState(null);
    const [delayMarkers, setDelayMarkers] = useState(null);
    const [matches, setMatches] = useState(null);
    const inputRef = useRef(null);
    const mapRef = useRef(null);
    const isFocused = useIsFocused();

    //Runs once - fetches stations, delays and if logged in
    //favourites and sets to respective state.
    useEffect(() => {
        (async () => {
                const stationsList = await TrafficModel.getStations();
                const delaysList = await TrafficModel.getDelays();
                const status = await setCurrentLocationToUser();
                setStations(stationsList);
                setDelays(delaysList)
                if(isLoggedIn) {
                    const favs = await FavouriteModel.getFavourites();
                    setFavourites(favs);
                }
        })();
    }, []);

    // If in focus, refetch delays and favourites
    useEffect(() => {
        (async () => {
            reloadDelays();
            reloadFavourites();
        })()
    }, [isFocused]);
    
    // If delays/stations are set and/or changed
    // Fetch delays and set markers
    useEffect(() => {
        (async () => {
            if(stations && delays) {
                findDelays();
            }
        })();
    }, [stations, delays]);

    // If current location is updated - go to location
    // Be it searched station or user location
    useEffect(() => {
        (async () => {
            goToMarker();
        })();
    }, [currentLocation]);

    // If currentStation is chosen/changed and delays or favourites are
    // updated update favorite toggle-button to reflect possible change
    useEffect(() => {
        (async () => {
            if(currentStation && isLoggedIn) {
                const inFavourites = favourites.length === 0 ? [] : favourites.filter(station => { return station.artefact.LocationSignature === currentStation.LocationSignature; });
                setAddToFavoritesButton(
                    <Pressable
                    style={Typography.pressable}
                    onPress={() => {
                        changeFavorites((inFavourites.length !== 0), inFavourites.length !== 0 ? inFavourites[0].id : currentStation);
                    }}
                    >
                    <Ionicons 
                        style={Typography.headerIcons}
                        name={inFavourites.length !== 0 ? "star" : "star-outline"}/>
                </Pressable>
                );
            }
        })();
    }, [currentStation, delays, favourites] );

    // Animate region to marker (current location) coords
    function goToMarker() {
        if (currentLocation){
            setTimeout(() => {
                mapRef.current.animateToRegion({...currentLocation.coords, latitudeDelta: 0.01, longitudeDelta: 0.01}, 3000)
            }, 500)
        }
    }

    // get matches for stations if stations and delays loaded,
    // shown as autocomplete list when searching
    async function getMatches(searchString, set = false) {
        if(stations && delays) {
            const stationMatches = stations.filter((station) => { return station.AdvertisedLocationName.includes(searchString)})
            setMatches(stationMatches);
        }
    }

    // If station is selected from drop down auto-complete,
    // set input search string to station and set state of selected station.
    // Also empty matches (auto-complete list)
    async function onStationSelected(station) {
        setSearchLocation(station.AdvertisedLocationName);
        inputRef.current.setNativeProps({ text: station.AdvertisedLocationName })
        setSelectedStation(station);
        setMatches([]);
    }

    // Reload favourites and set state
    async function reloadFavourites() {
        if(isLoggedIn) {
            const listOfFavourites = await FavouriteModel.getFavourites();
            setFavourites(listOfFavourites);
        }
    }

    // Reload delays and set state
    async function reloadDelays() {
        const dels = await TrafficModel.getDelays();
        setDelays(dels);
    }

    // Reload and set state of delays and favourites
    async function reload() {
        reloadDelays();
        reloadFavourites();
    }

    // Set current location and marker to user
    // Marker uses callout box for displaying info.
    // Callout box is pressable and will send to search-station route,
    // showing delays for a single searched station
    async function setCurrentLocationToUser() {
        const { status } = await Location.requestForegroundPermissionsAsync();
    
        if (status !== 'granted') {
            showMessage({
                message: "GPS-lokalisering",
                description: "Tillstånd till lokalisering nekades.",
                type: "warning",
            });
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
                <View style={Base.calloutStyle}>
                    <Text>Min plats</Text>
                </View>
            </Callout>
        </Marker>
        );
    }

    // Change favourites, data takes either a station object if added (and not in favourites yet)
    // or an id for removal (if in favourites)
    async function changeFavorites(inFavourites, data) {
        const result = !inFavourites ? await FavouriteModel.addFavourite(data) : await FavouriteModel.removeFavourite(data);
        reloadFavourites();
    }

    // Go to searched station, called on input submit
    // If delays are found for station, user is sent to corresponding 
    // delay marker, if not, new marker is created and navigated to.
    // Callouts for markers are pressable and navigate to station-details page.
    async function goToSearch() {
        let stationMatch = selectedStation;

        // If no selected station, do a partial search on stations and select
        // 1st result
        if(!selectedStation) {
            stationMatch = stations.filter((station) => { return station.AdvertisedLocationName.includes(searchLocation)})[0];
            setMatches([]);
            if(stationMatch) {
                inputRef.current.setNativeProps({ text: stationMatch.AdvertisedLocationName })
                setSearchLocation(stationMatch.AdvertisedLocationName);
            }
        }
        // if no matches, show flash message
        if (!stationMatch) {
            showMessage({
                message: "Sökresultat",
                description: "Inga stationer hittades",
                type: "default",
            });
            return;
        }
        let searchMarker = null;

        // if delaymarkers are set, check against them and set temp marker to result
        if(delayMarkers) {
            searchMarker = delayMarkers.filter(delayMarker => { return delayMarker.key === stationMatch.LocationSignature})[0];
        }
        const curLoc = {coords: strToCoords(stationMatch.Geometry.WGS84)};

        // if searchmarker is not yet set, it means station exists but has no delay,
        // create corresponding marker with callout and set state
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
                    <View style={Base.calloutStyle}>
                        <Text style={Typography.calloutHeaderStyle}>{stationMatch.AdvertisedLocationName}</Text>
                        <Text style={Typography.calloutTextStyle}>{"\nInga förseningar"}</Text>
                    </View>
                </Callout>
            </Marker> 
            );
        }

        //set states
        setCurrentLocation(curLoc);
        setCurrentStation(stationMatch);
        setLocationMarker(searchMarker);
        setSelectedStation(null);
    }

    // Go to station-details page
    function goToScreen(station) {
        navigation.navigate('Sök station', {
            screen: 'Search',
            params: { passedStation: station }
        });
    }

    // Find delay markers, called when delays/stations are loaded and/or changed.
    async function findDelays() {
        // filter delayed stations
        const listOfDelayStations = stations
        .filter((station) => {
            return delays.some((delay) => {
              return (delay.FromLocation ? delay.FromLocation[0].LocationName : null) === station.LocationSignature;
            });
          });

        // Create markers for delayed stations with a array-map call.
        const delayedStationMarkers = listOfDelayStations
            .map((station, index) => {
                const curDelay = delays
                    .filter((delay) => { return (delay.FromLocation ? delay.FromLocation[0].LocationName : null) === station.LocationSignature; });
                let calloutContent = "";
                // Loop through delays for stations and add to content var.
                curDelay.forEach(delay => {
                    const formattedDates = formatDates(
                        delay.AdvertisedTimeAtLocation,
                        delay.EstimatedTimeAtLocation
                    ); 
                    // Filter out arrival station
                    const arrival = stations.filter((stationInner) => { return (delay.ToLocation ? delay.ToLocation[0].LocationName : null) === stationInner.LocationSignature;});
                    
                    // Set content for callout
                    calloutContent += "\nTåg till " + arrival[0].AdvertisedLocationName;
                    calloutContent += "\nAvgång kl: " + adTime.toLocaleString('sv-SE', options);
                    calloutContent += "\nNy beräknad avgångstid: " + estTime.toLocaleString('sv-SE', options) +"\n";
                });
                // Create marker for cur. station
                return <Marker
                    coordinate={{
                        latitude: strToCoords(station.Geometry.WGS84).latitude,
                        longitude: strToCoords(station.Geometry.WGS84).longitude
                    }}
                    key={station.LocationSignature}
                    title={station.AdvertisedLocationName}
                    pinColor="red"
                    >
                        <Callout onPress={()=>{goToScreen(station)}}>
                            <View style={Base.calloutStyle}>
                                <Text>{station.AdvertisedLocationName}</Text>
                                <Text>{calloutContent}</Text>
                            </View>
                        </Callout>
                    </Marker>; 
            });
        // set markers to state
        setDelayMarkers(delayedStationMarkers);
    }

    // Return mapview, header is created with DoubleHeader component
    return (
        <View style={MapStyle.container}>
            <DoubleHeader
                title="Sök på karta"
                search={goToSearch}
                reload={reload}
                inputRef={inputRef}
                favoriteButton={addToFavoritesButton}
                textChange={(content) => {
                    setSearchLocation(content);
                    getMatches(content, true);
                }}
                navigation={navigation}
            />
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

