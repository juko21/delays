import { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import AppLoading from 'expo-app-loading';
import { useFonts, Lato_300Light, Lato_300Light_Italic, Lato_400Regular, Lato_400Regular_Italic, Lato_700Bold, Lato_700Bold_Italic } from '@expo-google-fonts/lato';
import Home from "./components/Home.tsx";
import Map from "./components/Map.tsx";
import DelaysList from "./components/DelaysList.tsx";

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Base } from './styles/index.js';
import Auth from "./components/auth/Auth.tsx";
import Logout from "./components/auth/Logout.tsx";

const Tab = createBottomTabNavigator();
const routeIcons = {
    "Karta": "navigate-circle-outline",
    "Sök station": "search-outline",
    "Logga in": "log-in-outline",
    "Logga ut": "log-out-outline"
};

export default function App() {
    const [currentGPSLocation, setCurrentGPSLocation] = useState<Partial<LocationCoords>>({});
    const [isLoggedIn, setIsLoggedIn] = useState<Boolean>(false);

    const fonts = {
        Lato_300Light,
        Lato_300Light_Italic,
        Lato_400Regular,
        Lato_400Regular_Italic,
        Lato_700Bold,
        Lato_700Bold_Italic
    };

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
    }

    return (
        <SafeAreaView style={Base.container}>
            <NavigationContainer>
                <Tab.Navigator screenOptions={({ route }) => ({
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
                        {() => <Map currentGPSLocation={currentGPSLocation} setCurrentGPSLocation={setCurrentGPSLocation} />}
                    </Tab.Screen>
                    <Tab.Screen name="Sök station">
                        {() => <DelaysList />}
                    </Tab.Screen>
                    {isLoggedIn ?
                        <Tab.Screen name="Logga ut">
                        {() => <Logout setIsLoggedIn={setIsLoggedIn} />}
                        </Tab.Screen>
                        :
                        <Tab.Screen name="Logga in">
                            {() => <Auth setIsLoggedIn={setIsLoggedIn} />}
                        </Tab.Screen>
                    }
                </Tab.Navigator>
            </NavigationContainer>
            <StatusBar style="auto" />
            <FlashMessage position="top" />
        </SafeAreaView>
    );
}
