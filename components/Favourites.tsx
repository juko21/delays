// Pick.tsx
import { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Pressable, Text, TouchableOpacity, FlatList} from 'react-native';
import TrafficModel from '../models/traffic.ts';
import { Forms, Base, Typography, ListStyle } from '../styles/index.js';
import { showMessage } from "react-native-flash-message";
import { Ionicons } from '@expo/vector-icons';
import FavouriteModel from '../models/favourites';
import { List } from 'react-native-paper';

let firstRender = true;
export default function Favourites({ route, navigation, favourites, setFavourites}) {
    const [errorMessage, setErrorMessage] = useState(null);
    const [currentStation, setCurrentStation] = useState(null);
    const [stations, setStations] = useState(null);
    const [addToFavoritesButton, setAddToFavoritesButton] = useState(null);
    const [delays, setDelays] = useState(null);
    const [delayList, setDelayList] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const handlePress = () => setExpanded(!expanded);

    async function getFavourites() {
        const listOfFavourites = await FavouriteModel.getFavourites();
        setFavourites(listOfFavourites);
    }

    async function changeFavorites(inFavourites, data) {
        const result = !inFavourites ? await FavouriteModel.addFavourite(data) : await FavouriteModel.removeFavourite(data);
        getFavourites();
    }

    async function findDelays() {
        const delayData = favourites.map((station, index) => {
            const stationDelays = delays.filter((delay) => {
                return (delay.FromLocation ? delay.FromLocation[0].LocationName : null) === station.artefact.LocationSignature;
            });
            let delayDisplayList = stationDelays.map((delay, index) => {
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
                return [
                    arrivalStation[0].AdvertisedLocationName + ": " + adTime + " Försenad " + ((estDate-adDate) / 60000) + "min",
                    "Tåg till " + arrivalStation[0].AdvertisedLocationName,
                    "Avgångstid: " + adDateStr + "\n" + "Ny beräknad avångstid: " + estDateStr,
                    "Ny beräknad avångstid: " + estTime,

                ];
            });
            return [station.artefact.AdvertisedLocationName, delayDisplayList];
        });
        const delayStationDisplayList = delayData.map((item, index) => {
            return (
                <View key={index}>
                    <View style={Base.delayListHeader}><Text style={Typography.delayListheader}>{item[0]}</Text></View>
                    { (item[1].length > 0 ? (
                            item[1].map((item2, index2) => {
                            return (
                            <List.Accordion
                            style={ ListStyle.accordion }
                            key={"försening" + index + index2}
                            title={item2[0]}>
                                <List.Item 
                                    style={ ListStyle.accordionItem }
                                    titleStyle={ ListStyle.accordionItemTitle }
                                    descriptionStyle={ ListStyle.accordionItemescription }
                                    title={item2[1]}
                                    description={item2[2]}
                                />
                            </List.Accordion>
                            
                            )})
                            )
                            : (<View style={Base.delayListCell}><Text style={Typography.base}>Inga förseningar</Text></View>))
                    }
                </View>
            );
        });
        setDelayList(delayStationDisplayList);
    }

    useEffect(() => {
        (async () => {
                firstRender = false;
                const stationsList = await TrafficModel.getStations();
                const listOfDelays = await TrafficModel.getDelays();
                getFavourites();
                setStations(stationsList);
                setDelays(listOfDelays);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if(stations && delays && favourites) {
                findDelays();
            }
        })();
    }, [stations, delays, favourites]);

    return (
            <ScrollView>
                <List.Section style={ ListStyle.accordionSection }>
                {delayList}
                </List.Section>
            </ScrollView>
    );
}