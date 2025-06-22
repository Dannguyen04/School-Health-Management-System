import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await api.get("/auth/profile");
                    setUser(response.data.user);
                } catch (error) {
                    localStorage.removeItem("token");
                    setUser(null);
                }
            }
            setLoading(false);
        };

        verifyUser();
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem("token", token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
