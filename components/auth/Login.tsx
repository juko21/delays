// auth/Login.tsx
import Auth from '../../interfaces/auth';
import { useState } from 'react';
import authModel from '../../models/auth.ts';
import AuthFields from './AuthFields.tsx';
import { showMessage } from "react-native-flash-message";

// Login screen component
export default function Login({navigation, setIsLoggedIn}) {
    const [auth, setAuth] = useState<Partial<Auth>>({});

    // Try logging in, if success, set isLoggedIn=true,
    // otherwise showmessage. If one or the other is missing
    // show corresponding msg.
    async function doLogin() {
        if (auth.email && auth.password) {
            const result = await authModel.login(auth.email, auth.password);

            if (result.type === "success") {
                setIsLoggedIn(true);
            }
    
            showMessage({
                message: result.title,
                description: result.message,
                type: result.type,
            });
        } else {
            showMessage({
                message: "Saknas",
                description: "E-post eller lösenord saknas",
                type: "warning",
            });
        }
    }

    // Return authfield component with props
    return (
        <AuthFields
            auth={auth}
            setAuth={setAuth}
            submit={doLogin}
            title="Logga in"
            navigation={navigation}
        />
    );
};