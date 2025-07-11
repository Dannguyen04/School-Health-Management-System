import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { tokenUtils } from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shouldScrollToServices, setShouldScrollToServices] = useState(false);

    // Function to verify user token
    const verifyUser = async () => {
        const token = tokenUtils.getToken();

        if (token) {
            try {
                // Set the token in API headers first
                tokenUtils.setToken(token);

                // Try to get user profile to verify token
                const response = await api.get("/auth/profile");

                if (response.data.success && response.data.user) {
                    setUser(response.data.user);
                } else {
                    // If profile fetch fails, clear token
                    tokenUtils.removeToken();
                    setUser(null);
                }
            } catch (error) {
                // Only clear token on 401 errors, not network errors
                if (error.response?.status === 401) {
                    tokenUtils.removeToken();
                    setUser(null);
                }
            }
        } else {
            // No token found, ensure headers are cleared
            tokenUtils.removeToken();
            setUser(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        verifyUser();
    }, []);

    const login = (userData, token) => {
        try {
            // Validate token and userData
            if (!token || !userData) {
                return;
            }

            // Set user state
            setUser(userData);

            // Save token using utility function
            tokenUtils.setToken(token);
        } catch (error) {
            console.error("Error during login:", error);
        }
    };

    const logout = () => {
        try {
            setUser(null);
            tokenUtils.removeToken();
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const setScrollToServices = (value) => {
        setShouldScrollToServices(value);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading,
                shouldScrollToServices,
                setScrollToServices,
                verifyUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
