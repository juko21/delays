// auth/AuthFields.tsx
import { View, Text, TextInput, Button, Pressable } from "react-native";
import { Typography, Forms, Base, AuthStyle } from '../../styles';
import { Ionicons } from '@expo/vector-icons';
import Header from "../Header.tsx";

export default function AuthFields({ auth, setAuth, title, submit, navigation}) {
    return (
        <View style={{ display: "flex" }}>
            <Header
                title={title}
                navigation={navigation}
            />
            <View style={AuthStyle.container}>
                <TextInput
                    style={AuthStyle.input}
                    placeholder="Epost"
                    onChangeText={(content: string) => {
                        setAuth({ ...auth, email: content })
                    }}
                    value={auth?.email}
                    keyboardType="email-address"
                />
                <TextInput
                    style={AuthStyle.input}
                    placeholder="Lösenord"
                    onChangeText={(content: string) => {
                        setAuth({ ...auth, password: content })
                    }}
                    value={auth?.password}
                    secureTextEntry={true}
                />
                <Pressable
                    style={AuthStyle.pressable}
                    title={title}
                    onPress={() => {
                        submit();
                    }}
                >
                    <Text style={AuthStyle.pressableText}>Logga in</Text>
                </Pressable>
                {title === "Logga in" &&
                    <Pressable
                        style={AuthStyle.pressable}
                        onPress={() => {
                            navigation.navigate("Register");
                        }}
                    >
                        <Text style={AuthStyle.pressableText}>Registrera användare</Text>
                    </Pressable>
                }
            </View>
        </View>
    );
};