// Pick.tsx
import { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Pressable, Text, TouchableOpacity, FlatList} from 'react-native';
import TrafficModel from '../models/traffic.ts';
import { Forms, Typography, ListStyle } from '../styles/index.js';
import { showMessage } from "react-native-flash-message";
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import FavouriteModel from '../models/favourites.ts';
import formatDates from '../models/formatDates';
import { List } from 'react-native-paper';
import DoubleHeader from './DoubleHeader.tsx'


// Component for showing a list of delay details for specific station
// with ability to search for stations
export default function DelaysList({
    route,
    navigation,
    isLoggedIn,
    delays, setDelays,
    stations, setStations,
    favourites, setFavourites
}) {
    let passedStation = route.params ? route.params.passedStation : null;
    const [searchLocation, setSearchLocation] =  useState("");
    const [selectedStation, setSelectedStation] = useState(null);
    const [currentStation, setCurrentStation] = useState(null);
    const [matches, setMatches] = useState([]);
    const [addToFavoritesButton, setAddToFavoritesButton] = useState(null);
    const [delayList, setDelayList] = useState([]);
    const inputRef = useRef(null);
    const isFocused = useIsFocused();

    // Initially fetch stations if not set, delays an favourites and set
    // If a stations is passed as route param, set as selected station and
    // find delays, showing a list
    useEffect(() => {
        (async () => {
            if(!stations) { 
                const stat = await TrafficModel.getStations();
                setStations(stat);
            }
            reloadDelays();
            reloadFavourites();
            if(passedStation) { 
                onStationSelected(passedStation);
                findDelays(passedStation);
            }
        })();
    }, []);

    // If screen put in focus, check for station passed as route
    // param and set state and find delays if necessary
    useEffect(() => {
        if(passedStation) { 
            onStationSelected(passedStation);
            findDelays(passedStation);
        }
    }, [isFocused]);

    // On change/ state set of current station and favourites, generate/change 
    // favourites toggle button to current station and favourite state
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
    }, [currentStation, favourites] );

    useEffect(() => {
        (async () => {
            if(!isLoggedIn) {
                setAddToFavoritesButton(null);
            }
        })();
    }, [isLoggedIn] );

    // Reload delays and favourites
    async function reload() {
        reloadDelays();
        reloadFavourites();
    }

    // Get matches from current search string for autocomplete
    async function getMatches(searchString) {
        const stationMatches = stations.filter((station) => { return station.AdvertisedLocationName.includes(searchString)})
        setMatches(stationMatches);
    }

    // If station is selected in autocomplete drop down, set state for selected
    // station, searchloacation, empty matches and set input value to selected station name
    async function onStationSelected(station) {
        setSelectedStation(station);
        setSearchLocation(station.AdvertisedLocationName);
        inputRef.current.setNativeProps({ text: station.AdvertisedLocationName })
        setMatches([]);
    }

    // Reload favourites
    async function reloadFavourites() {
        if(isLoggedIn) {
            const listOfFavourites = await FavouriteModel.getFavourites();
            setFavourites(listOfFavourites);
        }
    }

    // Reload delays
    async function reloadDelays() {
        const dels = await TrafficModel.getDelays();
        setDelays(dels);
    }

    // Change favourites in api, if infavourites, data id is passed as data for removal, otherwise
    // station object is passed to be added
    async function changeFavorites(inFavourites, data) {
        const result = !inFavourites ? await FavouriteModel.addFavourite(data) : await FavouriteModel.removeFavourite(data);
        reloadFavourites();
    }

    // Navigate to screen waiting - showing how far you can walk until 
    // your train departures
    function goToScreen(arr, sta, del) {
        navigation.navigate('Sök station', {
            screen: "Waiting",
            params: { 
                waitingStation: sta,
                waitingDelay: del,
                arrivalStation: arr 
            }
            })
    }

    // Find all delays for station
    async function findDelays(passStation = null) {
        let stationMatch = null;
        // If a station is passed and not null, set match to passed station
        if(passStation) {
            stationMatch = passStation;
        } else { // Else check for selected station, and if not, do partial search in station array
            stationMatch = selectedStation;
            if(!selectedStation) {
                stationMatch = stations.filter((station) => { return station.AdvertisedLocationName.includes(searchLocation)})[0];
                setMatches([]);
                if(stationMatch) {
                    inputRef.current.setNativeProps({ text: stationMatch.AdvertisedLocationName })
                    setSearchLocation(stationMatch.AdvertisedLocationName);
                }
            }
            // If station match is not found, send flashmessage and return
            if (!stationMatch) {
                showMessage({
                    message: "Sökresultat",
                    description: "Inga stationer hittades",
                    type: "default",
                });
                return;
            }
        }

        //Set currentStation state and fetch delays filtered on stationmatch
        setCurrentStation(stationMatch);
        const listOfDepartureDelays = delays
        .filter(delay => { 
            return (delay.FromLocation ? delay.FromLocation[0].LocationName : null) === stationMatch.LocationSignature;
        });
        // Run array map to create accordion list items
        const delayDisplayList = listOfDepartureDelays.map((delay, index) => {
            // Find arrival station for delay
            const arrivalStation = stations
                .filter((station) => { 
                    return (delay.ToLocation ? delay.ToLocation[0].LocationName : null) === station.LocationSignature;
            });
            // Get formatted date/time data
            const formattedDates = formatDates(
                delay.AdvertisedTimeAtLocation,
                delay.EstimatedTimeAtLocation
            ); 
            // Create Accordion list item for array, including second list item linking
            // to "where can I go"-page
            return (
                <List.Accordion
                style={ ListStyle.accordion }
                titleStyle={ ListStyle.accordionTitle }
                descriptionStyle={ ListStyle.accordionDescription }
                key={index}
                title={formattedDates.estTimeStr + " " + arrivalStation[0].AdvertisedLocationName}
                description={(<Text style={ListStyle.accordionDescription}><Text style={{color: "red", textDecorationLine: "line-through", fontSize: 16}}>{formattedDates.adTimeStr}</Text>{" Försenad " + formattedDates.delayMin + " min"}</Text>)}>
                    <List.Item 
                        style={ ListStyle.accordionItem }
                        titleStyle={ ListStyle.accordionItemTitle }
                        descriptionStyle={ListStyle.accordionItemDescription}
                        title={"Tåg till " + arrivalStation[0].AdvertisedLocationName}
                        description={"Avgångstid: " + formattedDates.adDateStr + "\n" + "Ny beräknad avångstid: " + formattedDates.estDateStr}
                    />
                    <List.Item
                        onPress={()=>{goToScreen(arrivalStation, stationMatch, delay )}}
                        left={props => <List.Icon {...props} color={'white'} icon="walk" />}
                        style={ ListStyle.accordionItemPressable }
                        titleStyle={ ListStyle.accordionItemPressableTitle }
                        descriptionStyle={ ListStyle.accordionItemPressableDescription }
                        title={"Underhåll dig under tiden"}
                    />
                </List.Accordion>
            );
        });
        // Set state for accordion list of delays, or string "No delays" if none found
        setDelayList(delayDisplayList.length ? delayDisplayList : (<Text style={Typography.base}>Inga förseningar</Text>));
        // Clear selected station
        setSelectedStation(null);
    }

    // Return list of delays, for header DoubleHeader component is used, for 
    // autocomplete dropdown flatlist is used.
    return (
        <View>
            <DoubleHeader
                title="Sök station"
                search={findDelays}
                reload={reload}
                inputRef={inputRef}
                favoriteButton={addToFavoritesButton}
                userLocation={null}x
                textChange={(content) => {
                    setSearchLocation(content);
                    getMatches(content, true);
                }}
                navigation={navigation}
            />
            <ScrollView>
                <List.Section style={ ListStyle.AccordionSection}>
                {delayList}
                </List.Section>
            </ScrollView>
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