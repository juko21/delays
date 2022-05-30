// Pick.tsx
import { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Pressable, Text, TouchableOpacity, FlatList} from 'react-native';
import * as Location from 'expo-location';
import TrafficModel from '../models/traffic.ts';
import distanceBetweenCoordinates from '../models/distance';
import { Forms, Base, Typography } from '../styles/index.js';
import getCoordinates from "../models/nominatim";
import strToCoords from '../models/stringToCoordinate.ts';
import { showMessage } from "react-native-flash-message";
import { Ionicons } from '@expo/vector-icons';
4
export default function DelaysList({ route, navigation}) {
    const [searchLocation, setSearchLocation] =  useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [stations, setStations] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [currentStation, setCurrentStation] = useState(null);
    const [matches, setMatches] = useState([]);
    const [addToFavoritesButton, setAddToFavoritesButton] = useState(null);
    const [delays, setDelays] = useState(null);
    const [delayList, setDelayList] = useState([]);
    const inputRef = useRef(null);
    let firstRender = true;

    async function getMatches(searchString, set = false) {
        const stationMatches = stations.filter((station) => { return station.AdvertisedLocationName.includes(searchString)})
        setMatches(stationMatches);
    }

    async function onStationSelected(station) {
        setSearchLocation(station.AdvertisedLocationName);
        inputRef.current.setNativeProps({ text: station.AdvertisedLocationName })
        setSelectedStation(station);
        setMatches([]);
    }

    async function getSearchedStation() {
        const tempStation = stations
        .filter((station) => { 
            return (station.FromLocation ? delay.FromLocation[0].LocationName : null) === searchLocation.LocationSignature;
        });        
        setMatches([]);
    }
    async function addToFavorites() {
    }
    async function findDelays() {
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
        setCurrentStation(stationMatch);
        const listOfDepartureDelays = delays
        .filter(delay => { 
            return (delay.FromLocation ? delay.FromLocation[0].LocationName : null) === stationMatch.LocationSignature;
        });
        const delayDisplayList = listOfDepartureDelays.map((delay, index) => {
            const arrivalStation = stations
                .filter((station) => { 
                    return (delay.ToLocation ? delay.ToLocation[0].LocationName : null) === station.LocationSignature;
            });
            console.log("Till: ", arrivalStation);
            let adTime = new Date(delay.AdvertisedTimeAtLocation);
            adTime = adTime.getFullYear() + "/" + adTime.getMonth() + "/" + adTime.getDate() + " " + adTime.getHours() + ":" + String(adTime.getMinutes()).padStart(2, "0");
            let estTime = new Date(delay.EstimatedTimeAtLocation);
            estTime = estTime.getFullYear() + "/" + estTime.getMonth() + "/" + estTime.getDate() + " " + estTime.getHours() + ":" + String(estTime.getMinutes()).padStart(2, "0");
            return (
                <View style={Base.delayListContainer} key={index}>
                    <View style={Base.delayList}><Text style={Typography.base}>Tåg från {stationMatch.AdvertisedLocationName} till {arrivalStation[0 
                    ].AdvertisedLocationName}</Text></View>
                    <View style={Base.delayList}><Text style={Typography.base}>Avgångstid: {adTime}</Text></View>
                    <View style={Base.delayList}><Text style={Typography.base}>Ny beräknad avångstid {estTime}</Text></View>
                </View>
            );
        });
        setDelayList(delayDisplayList.length ? delayDisplayList : (<Text style={Typography.base}>Inga förseningar</Text>));
        setSelectedStation(null);
    }

    useEffect(() => {
        (async () => {
            if(firstRender) {
                firstRender = false;
                const stationsList = await TrafficModel.getStations();
                const listOfDelays = await TrafficModel.getDelays();
                setStations(stationsList);
                setDelays(listOfDelays);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if(currentStation) {
                setAddToFavoritesButton(
                    <Pressable
                    style={({ pressed }) => [
                        {
                          backgroundColor: pressed ? '#F4B007' : '#FAC33B',
                        },
                        Forms.pressableStar,
                    ]}
                    onPress={() => {
                        addToFavorites();
                    }}
                    >
                    <Ionicons 
                        style={Forms.star}
                        name="star-outline"/>
                </Pressable>

                );
            }
        })();
    }, [currentStation]);

    return (
        <View style={Base.container}>
            <View style={Forms.sidebyButtonSearch}>
                <View style={Forms.inputWrapper}>
                <TextInput
                    ref={inputRef}
                    style={{ ...Forms.wrappedInput }}
                    onChangeText={(content: string) => {
                        setSearchLocation(content);
                        getMatches(content, true);
                    }}
                />
                {addToFavoritesButton}
                </View>
                <Pressable
                    title="Sök"
                    style={({ pressed }) => [
                        {
                          backgroundColor: pressed ? '#F15B5B' : '#EE2A2A',
                        },
                        Forms.pressable,
                      ]}
                    onPress={() => {
                        findDelays();
                    }}
                >
                    <Ionicons style={Forms.buttonText} name="search-outline"/>
                </Pressable>
            </View>
            <View style={Base.paddedContainer}>
            {delayList}
            </View>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: "100%",
        height: "100%",
        marginBottom: 4
    },
    scrollContainer: {
        width: "100%",
        height: "50%",
        marginBottom: 4
    },
    productlistContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'baseline',
    },
});
