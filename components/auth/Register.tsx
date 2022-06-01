// auth/Login.tsx
import Auth from '../../interfaces/auth';
import { useState } from 'react';
import authModel from '../../models/auth.ts';
import AuthFields from './AuthFields.tsx';
import { showMessage } from "react-native-flash-message";

// Register screen component
export default function Register({ navigation }) {
    const [auth, setAuth] = useState<Partial<Auth>>({});

    // Try registering, if successful show success msg,
    // if a field is missing, show flash message.
    async function registerUser() {
        if (auth.email && auth.password) {
            const result = await authModel.register(auth.email, auth.password);
            navigation.navigate("Login", { reload: true });
            showMessage({
                message: "Registrerad",
                description: "Ny användare har registrerats",
                type: "success",
            });
        }
        else {
            showMessage({
                message: "Fält Saknas",
                description: "E-post eller lösenord saknas",
                type: "warning",
            });
        }
    }

    return (
        <AuthFields
            auth={auth}
            setAuth={setAuth}
            submit={registerUser}
            title="Registrera Användare"
            navigation={navigation}
        />
    );
};