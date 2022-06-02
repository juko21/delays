import 'react-native-gesture-handler';
import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import Map from "./components/Map.tsx";
import Delays from "./components/Delays.tsx";
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { View, Text, Pressable } from 'react-native';
import { createDrawerNavigator, DrawerItemList } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Base, Typography, DrawerStyle } from './styles/index.js';
import Auth from "./components/auth/Auth.tsx";
import Logout from "./components/auth/Logout.tsx";

//Drawer nested in stack navigator
//In order to access navigation.push, for navigating to same screen
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

//Route icons for menu options
const routeIcons = {
    "Sök på karta": "navigate-circle-outline",
    "Sök station": "search-outline",
    "Favoriter": "star-outline",
    "Logga in": "log-in-outline",
    "Logga ut": "log-out-outline"
};

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<Boolean>(false);
    const [favourites, setFavourites] = useState(null);
    const [delays, setDelays] = useState(null);
    const [stations, setStations] = useState(null);
    const [appIsReady, setAppIsReady] = useState(false);
    const navigationRef = useNavigationContainerRef();
    
    //Define font path
    const fonts = {
        'NotoSans-Regular': require('./assets/fonts/NotoSans-Regular.ttf'),
    };
    //Preload font and show splashscreeen until finished
    useEffect(() => {
        (async () => {
        try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync(fonts);
        } catch (e) {
        console.warn(e);
        } finally {
        setAppIsReady(true);
        }
        })();
    }, []);

    //Hide splashscreen when app is ready loaded
    useEffect(() => {
        (async () => {
            if (appIsReady) {
                await SplashScreen.hideAsync();
            }
        })();
    }, [appIsReady]);

    //If app is not ready, return null
    if (!appIsReady) {
        return null;
    }

    // Returning Stack navigator, in which drawer navigator is nested
    // This is so that favourites in drawer menu can be accessed through
    // navigation push, even when on the same screen (screen: "search")

    return (
        <SafeAreaView style={Base.container}>
            <NavigationContainer
                initialRouteName="Drawer"
                ref={navigationRef}
            >
                <Stack.Navigator   
                    screenOptions={{headerShown: false}}
                    initialRouteName='Drawer'>
                        <Stack.Screen name="Drawer">
                        {(screenProps) => <DrawerNavigation 
                            {...screenProps}
                            options={{headerShown: false}}
                            stations={stations}
                            setStations={setStations}
                            delays={delays}
                            setDelays={setDelays}
                            favourites={favourites}
                            setFavourites={setFavourites}
                            isLoggedIn={isLoggedIn}
                            navigationRef={navigationRef}
                            setIsLoggedIn={setIsLoggedIn}
                        />}
                    </Stack.Screen>
                </Stack.Navigator>
            </NavigationContainer>
            <StatusBar style="auto" />
            <FlashMessage position="top" />
        </SafeAreaView>
    );
}

// Custom drawer for drawer nav, including header and navigation links
// to favourites if logged in. (Done through navigation.push)
const CustomDrawer = (props) => {
    favouriteLabels = null;
    // If logged in and there are favourites - generate menu
    // with links to search-screen with favorite station as param
    if (props.isLoggedIn && props.favourites !== null) {
        favouriteLabels = props.favourites.map((fav, index) => {
            return (
                <Pressable 
                    key={index}
                    onPress={()=>{
                        if(props.navigationRef.getCurrentRoute().name === 'Search') {
                            props.navigation.push('Search', { passedStation: fav.artefact});
                            props.navigation.closeDrawer();
                        } else {
                            props.navigation.navigate('Search', { passedStation: fav.artefact});
                            props.navigation.closeDrawer();
                        }
                    }}
                    >
                    <Text style={ DrawerStyle.drawerFavouriteText }>
                        <Ionicons 
                            style={Typography.drawerFavouriteText}
                            name="star"
                        />
                        {"  " + fav.artefact.AdvertisedLocationName}
                    </Text>
                </Pressable>
                );
        });
    }

    //Return custom drawer
    return (
        <View>
            <View style={ DrawerStyle.drawerHeader } {...props}>
                <Text style={ DrawerStyle.drawerHeaderText }>Försenat?</Text>
            </View>
            <DrawerItemList {...props} />
            <View style={ DrawerStyle.favouriteList }>
                <Text style={ DrawerStyle.drawerFavouriteHeader }>Favoriter</Text>
                {favouriteLabels}
            </View>
        </View>
    );
};


// Drawer navigation - main navigation of the app, but due to the need to
// use navigation.push - the menu needs to be nested in a stack navigator and
// is thus defined as separate component.
const DrawerNavigation = (props) => {
    let favourites = props.favourites;
    let isLoggedIn = props.isLoggedIn;
    const navRef = props.navigationRef
    return (
        <Drawer.Navigator 
            screenOptions={({ route }) => ({
                headerShown: true,
                drawerIcon: ({ focused, color, size }) => {
                let iconName = routeIcons[route.name] || "alert";

                return <Ionicons style={DrawerStyle.drawerScreenStyle} name={iconName} color={color} />;
                },
                drawerActiveTintColor: '#D57C7A',
                drawerInactiveTintColor: '#000000',
                headerShown: false,
                drawerLabelStyle: DrawerStyle.drawerScreenStyle,
            })}
            drawerContent={props => <CustomDrawer {...props} navigationRef={navRef} isLoggedIn={isLoggedIn} favourites={favourites} />}
        >
            <Drawer.Screen name="Sök på karta">
                {(screenProps) => <Map {...screenProps} stations={props.stations} setStations={props.setStations} delays={props.delays} setDelays={props.setDelays} favourites={props.favourites} setFavourites={props.setFavourites} isLoggedIn={props.isLoggedIn} />}
            </Drawer.Screen>
            <Drawer.Screen key="stationSearch" name="Sök station">
                {(screenProps) => <Delays {...screenProps} stations={props.stations} setStations={props.setStations} delays={props.delays} setDelays={props.setDelays} favourites={props.favourites} setFavourites={props.setFavourites} isLoggedIn={props.isLoggedIn} />}
            </Drawer.Screen>
            {props.isLoggedIn ?
                <Drawer.Screen name="Logga ut">
                    {(screenProps) => <Logout {...screenProps} setIsLoggedIn={props.setIsLoggedIn} />}
                </Drawer.Screen>
                :
                <Drawer.Screen name="Logga in">
                    {(screenProps) => <Auth {...screenProps} setIsLoggedIn={props.setIsLoggedIn} />}
                </Drawer.Screen>
            }
        </Drawer.Navigator>
    )
};
