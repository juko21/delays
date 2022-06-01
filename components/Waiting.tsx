// Pick.tsx
import { useState, useEffect, useRef } from 'react';
import { View, Text} from 'react-native';
import MapView from 'react-native-maps';
import { Marker, Callout, Circle } from "react-native-maps";
import { Base, Typography, MapStyle } from '../styles/index.js';
import strToCoords from '../models/stringToCoordinate.ts';
import formatDates from '../models/formatDates.ts';
import Header from './Header.tsx';


// Screen showing how far you can walk until dep. time
// of delayed train from supplied station.
export default function Waiting({ route, navigation }) {
    const [delayMarker, setDelayMarker] = useState(null);
    const [travelCircle, setTravelCircle] = useState(null);
    const mapRef = useRef(null);
    // get delay, station and arrival station from route params
    const {waitingDelay, waitingStation, arrivalStation} = route.params ? route.params : null;
    
    // Set all content for screen
    async function setContent() {
        // Get formatted times for delay
        const formattedDates = formatDates(
            waitingDelay.AdvertisedTimeAtLocation,
            waitingDelay.EstimatedTimeAtLocation
        ); 
        // Set callout title an content
        let title = waitingStation.AdvertisedLocationName;
        let content = "Tåg till " + arrivalStation[0].AdvertisedLocationName + "\n"
        content += "Avgångstid " + formattedDates.adDateStr + "\n";
        content += "Ny beräknad avgångstid " + formattedDates.estDateStr + "\n";
        content += `\n\nMed ${formattedDates.timeDiff} min på dig till tåget beräknar vi att`;
        content += `\ndu hinner gå ca. ${formattedDates.travelDistance}m fram och tillbaka.`;

        // Set marker and callout for delay and station
        const marker = (
        <Marker
            coordinate={{
                latitude: strToCoords(waitingStation.Geometry.WGS84).latitude,
                longitude: strToCoords(waitingStation.Geometry.WGS84).longitude
            }}
            key={waitingStation.LocationSignature}
            title={waitingStation.AdvertisedLocationName}
            pinColor="red"
        >
        <Callout>
        <View style={Base.calloutStyle}>
                <Text style={Typography.calloutHeaderStyle}>{title}</Text>
                <Text style={Typography.calloutTextStyle}>{content}</Text>
            </View>
        </Callout>
        </Marker>
        );

        // Generate circle based on station location and calculated possible
        // travel time (calculated as 100m / min minus 15 min at destination)
        const circle = (
            <Circle
                center={{
                    latitude: strToCoords(waitingStation.Geometry.WGS84).latitude,
                    longitude: strToCoords(waitingStation.Geometry.WGS84).longitude,
                }}
                radius={formattedDates.travelDistance}
                fillColor="rgba(108, 214, 231, 0.3)"
                strokeWidth={1}
                strokeColor="rgba(42, 105, 146, 0.3)"
            />
        )
        // set states of circle and marker for rendering
        setTravelCircle(circle);
        setDelayMarker(marker);
    }

    // Set content on load from route params
    useEffect(() => {
        (async () => {
            setContent();
        })();
    }, []);

    // Return map view
    return (
        <View style={MapStyle.container}>
            <Header
                title="Hur långt hinner du?"
                navigation={navigation}
            />
            <MapView
                ref={mapRef}
                style={MapStyle.map}
                initialRegion={{ 
                    latitude: strToCoords(waitingStation.Geometry.WGS84).latitude,
                    longitude: strToCoords(waitingStation.Geometry.WGS84).longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}>
                {delayMarker}
                {travelCircle}
            </MapView>
        </View>
    );
}

