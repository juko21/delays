// Header.tsx
import { View, Text, Pressable, TextInput } from "react-native";
import { Typography, Base } from '../styles/index.js';
import { Ionicons } from '@expo/vector-icons';

export default function DoubleHeader({ title, inputRef, search, reload, navigation, textChange, favoriteButton}) {
    return (
        <View style={Base.header}>
            <View style={Base.headerRow}>
                <Pressable
                    style={Typography.hamburger}
                    onPress={() => {
                        navigation.openDrawer();
                    }}
                >
                    <Ionicons style={Typography.hamburgerIcon} name="menu-outline"/>
                </Pressable>
                <Text style={[ Typography.headerTitle, Typography.headerText ]}>{ title }</Text>
                <View style={Typography.headerButtons}>
                <Pressable
                    title="Sök"
                    style={Typography.pressable}
                    onPress={() => {
                        search();
                }}>
                <Ionicons style={Typography.headerIcons} name="search-outline"/>
                </Pressable>
                {favoriteButton}
                <Pressable
                    title="Uppdatera"
                    style={Typography.pressable}
                    onPress={() => {
                        reload();
                }}>
                <Ionicons style={Typography.headerIcons} name="refresh-outline"/>
                </Pressable>
                </View>
            </View>
            <View style={Base.headerRow2nd}>
                <TextInput
                    ref={inputRef}
                    style={{ ...Base.headerInput }}
                    placeholder="Sök station"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    onChangeText={(content: string) => {
                        textChange(content);
                }}/>
            </View>
        </View>
    );
};