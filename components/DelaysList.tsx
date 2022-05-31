// Pick.tsx
import { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Pressable, Text, TouchableOpacity, FlatList} from 'react-native';
import TrafficModel from '../models/traffic.ts';
import { Forms, Base, Typography, ListStyle } from '../styles/index.js';
import { showMessage } from "react-native-flash-message";
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import FavouriteModel from '../models/favourites';
import { List, Colors } from 'react-native-paper';

export default function DelaysList({ route, navigation, isLoggedIn, favourites, setFavourites}) {
    let passedStation = route.params ? route.params.params.passedStation : null;
    const [errorMessage, setErrorMessage] = useState(null);
    const [stations, setStations] = useState(null);
    const [delays, setDelays] = useState(null);
    const [searchLocation, setSearchLocation] =  useState("");
    const [selectedStation, setSelectedStation] = useState(null);
    const [currentStation, setCurrentStation] = useState(null);
    const [matches, setMatches] = useState([]);
    const [addToFavoritesButton, setAddToFavoritesButton] = useState(null);
    const [delayList, setDelayList] = useState([]);
    const inputRef = useRef(null);
    const [expanded, setExpanded] = useState(false);
    const handlePress = () => setExpanded(!expanded);
    const isFocused = useIsFocused();
    let firstRender = true;
    console.log(route);
    async function getMatches(searchString, set = false) {
        const stationMatches = stations.filter((station) => { return station.AdvertisedLocationName.includes(searchString)})
        setMatches(stationMatches);
    }

    async function onStationSelected(station) {
        setSelectedStation(station);
        setSearchLocation(station.AdvertisedLocationName);
        inputRef.current.setNativeProps({ text: station.AdvertisedLocationName })
        setMatches([]);
    }
    async function getFavourites() {
        if(isLoggedIn) {
            const listOfFavourites = await FavouriteModel.getFavourites();
            setFavourites(listOfFavourites);
        }
    }
    async function getSearchedStation() {
        const tempStation = stations
        .filter((station) => { 
            return (station.FromLocation ? delay.FromLocation[0].LocationName : null) === searchLocation.LocationSignature;
        });        
        setMatches([]);
    }

    async function changeFavorites(inFavourites, data) {
        const result = !inFavourites ? await FavouriteModel.addFavourite(data) : await FavouriteModel.removeFavourite(data);
        getFavourites();
    }

    useEffect(() => {
        if(passedStation) { 
            console.log("GOT HERE");
            onStationSelected(passedStation);
            findDelays(passedStation);
        }
    }, [isFocused]);

    async function findDelays(passStation = null) {
        let stationMatch = null;
        if(passStation) {
            stationMatch = passStation;
        } else {
            stationMatch = selectedStation;
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
            let adDate = new Date(delay.AdvertisedTimeAtLocation);
            let adTime = adDate.getHours() + ":" + String(adDate.getMinutes()).padStart(2, "0");
            let adDateStr = adDate.getFullYear() + "/" + adDate.getMonth() + "/" + adDate.getDate() + " " + adTime;
            let estDate = new Date(delay.EstimatedTimeAtLocation);
            let estTime = estDate.getHours() + ":" + String(estDate.getMinutes()).padStart(2, "0");
            let estDateStr = estDate.getFullYear() + "/" + estDate.getMonth() + "/" + estDate.getDate() + " " + estTime;
            return (
                <List.Accordion
                titleStyle={ ListStyle.accordionTitle }
                key={index}
                title={arrivalStation[0].AdvertisedLocationName + ": " + adTime + " Försenad " + ((estDate-adDate) / 60000) + "min"}>
                    <List.Item 
                        style={ ListStyle.accordionItem }
                        titleStyle={ ListStyle.accordionItemTitle }
                        descriptionStyle={ ListStyle.accordionItemDescription }
                        title={"Tåg till " + arrivalStation[0].AdvertisedLocationName}
                        description={"Avgångstid: " + adDateStr + "\n" + "Ny beräknad avångstid: " + estDateStr}
                    />
                    <List.Item
                        left={props => <List.Icon {...props} color={'white'} icon="walk" />}
                        style={ ListStyle.accordionItemPressable }
                        titleStyle={ ListStyle.accordionItemPressableTitle }
                        descriptionStyle={ ListStyle.accordionItemPressableDescription }
                        title={"Underhåll dig under tiden"}
                        onPress={navigation.navigate('Sök', {
                            screen: 'Waiting',
                            params: { 
                                waitingStation: stationMatch,
                                waitingDelay: delay,
                                arrivalStation: arrivalStation 
                            }
                        })}
                    />
                </List.Accordion>
            );
        });
        setDelayList(delayDisplayList.length ? delayDisplayList : (<Text style={Typography.base}>Inga förseningar</Text>));
        setSelectedStation(null);
    }

    useEffect(() => {
        (async () => {
            const stationsList = await TrafficModel.getStations();
            const listOfDelays = await TrafficModel.getDelays();
            getFavourites();
            setStations(stationsList);
            setDelays(listOfDelays);
            console.log(passedStation);
            if(passedStation) { 
                console.log(passedStation);
                onStationSelected(passedStation);
                findDelays(passedStation);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if(currentStation && isLoggedIn) {
                const inFavourites = favourites.length === 0 ? [] : favourites.filter(station => { return station.artefact.LocationSignature === currentStation.LocationSignature; });
                setAddToFavoritesButton(
                    <Pressable
                    style={({ pressed }) => [
                        {
                          backgroundColor: inFavourites.length !== 0 ? (pressed ? '#F4B007' : '#FAC33B') :
                          (pressed ? '#ccc' : '#ddd'),
                        },
                        Forms.pressableStar
                    ]}
                    onPress={() => {
                        changeFavorites((inFavourites.length !== 0), inFavourites.length !== 0 ? inFavourites[0].id : currentStation);
                    }}
                    >
                    <Ionicons 
                        style={Forms.star}
                        name={inFavourites.length !== 0 ? "star" : "star-outline"}/>
                </Pressable>
                );
            }
        })();
    }, [currentStation,favourites] );

    return (
        <View>
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
            <List.Section>
            {delayList}
            </List.Section>
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