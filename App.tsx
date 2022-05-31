import { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import AppLoading from 'expo-app-loading';
import { useFonts, Lato_300Light, Lato_300Light_Italic, Lato_400Regular, Lato_400Regular_Italic, Lato_700Bold, Lato_700Bold_Italic } from '@expo-google-fonts/lato';
import Home from "./components/Home.tsx";
import Map from "./components/Map.tsx";
import DelaysList from "./components/DelaysList.tsx";
import Delays from "./components/DelaysList.tsx";
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Base } from './styles/index.js';
import Auth from "./components/auth/Auth.tsx";
import Logout from "./components/auth/Logout.tsx";
import Favourites from "./components/Favourites.tsx";

const Tab = createBottomTabNavigator();
const routeIcons = {
    "Karta": "navigate-circle-outline",
    "Sök": "search-outline",
    "Favoriter": "star-outline",
    "Logga in": "log-in-outline",
    "Logga ut": "log-out-outline"
};

export default function App() {
    const [currentGPSLocation, setCurrentGPSLocation] = useState<Partial<LocationCoords>>({});
    const [isLoggedIn, setIsLoggedIn] = useState<Boolean>(false);
    const [favourites, setFavourites] = useState([]);
    const [appIsReady, setAppIsReady] = useState(false);

    const fonts = {
        'Rubik-Light': require('./assets/fonts/Rubik-Light.ttf'),
        'Rubik-Regular': require('./assets/fonts/Rubik-Regular.ttf'),
        'Rubik-Medium': require('./assets/fonts/Rubik-Medium.ttf'),
        'Rubik-Bold': require('./assets/fonts/Rubik-Bold.ttf'),
        'Rubik-SemiBold': require('./assets/fonts/Rubik-SemiBold.ttf'),
        'Rubik-Italic': require('./assets/fonts/Rubik-Italic.ttf'),
        'Rubik-LightItalic': require('./assets/fonts/Rubik-LightItalic.ttf'),
        'Rubik-BolItalic': require('./assets/fonts/Rubik-BoldItalic.ttf'),
    };
    /*
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
    (async () => {
        try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync({ fonts });
        }
        catch {
        // handle error
        }
        finally {
        setAppIsReady(true);
        }
    })();
    }, []);

    const onLayout = useCallback(() => {
    if (appIsReady) {
        SplashScreen.hideAsync();
    }
    }, [appIsReady]);

    if (!appIsReady) {
    return null;
    }*/

    useEffect(() => {
        (async () => {
        try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync(fonts);
        console.log("waiting");
        } catch (e) {
        console.warn(e);
        } finally {
        // Tell the application to render
        setAppIsReady(true);
        await SplashScreen.hideAsync();
        }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if (appIsReady) {
                // This tells the splash screen to hide immediately! If we call this after
                // `setAppIsReady`, then we may see a blank screen while the app is
                // loading its initial state and rendering its first pixels. So instead,
                // we hide the splash screen once we know the root view has already
                // performed layout.
                console.log("waiting?");
        
                await SplashScreen.hideAsync();
            }
        })();
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <SafeAreaView style={Base.container}>
            <NavigationContainer>
                <Tab.Navigator initialRouteName="Karta" screenOptions={({ route, navigation }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                let iconName = routeIcons[route.name] || "alert";

                return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'blue',
                tabBarInactiveTintColor: 'gray',
                
                headerShown: false
                })}
                >
                    <Tab.Screen name="Karta">
                    {(screenProps) => <Map {...screenProps} currentGPSLocation={currentGPSLocation} setCurrentGPSLocation={setCurrentGPSLocation} />}
                    </Tab.Screen>
                    <Tab.Screen name="Sök">
                    {(screenProps) => <Delays {...screenProps} isLoggedIn={isLoggedIn} favourites={favourites} setFavourites={setFavourites}/>}
                    </Tab.Screen>
                    {isLoggedIn ?
                        <Tab.Screen name="Favoriter">
                        {(screenProps) => <Favourites {...screenProps} setIsLoggedIn={isLoggedIn} favourites={favourites} setFavourites={setFavourites}/>}
                        </Tab.Screen>
                        :
                        <Tab.Screen name="Logga in">
                            {(screenProps) => <Auth {...screenProps} setIsLoggedIn={setIsLoggedIn} />}
                        </Tab.Screen>
                    }
                    {isLoggedIn &&
                        <Tab.Screen name="Logga ut">
                            {(screenProps) => <Logout {...screenProps} setIsLoggedIn={setIsLoggedIn} />}
                        </Tab.Screen>
                    }                
                </Tab.Navigator>
            </NavigationContainer>
            <StatusBar style="auto" />
            <FlashMessage position="top" />
        </SafeAreaView>
    );
}
