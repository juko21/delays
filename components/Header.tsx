// Header.tsx
import { View, Text, Pressable } from "react-native";
import { Typography, Base } from '../styles';
import { Ionicons } from '@expo/vector-icons';

export default function Header({ title, navigation }) {
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
                <Text style={[ Typography.headerTitle, Typography.headerText ]}>{title}</Text>
            </View>
        </View>
    );
};