import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shouldScrollToServices, setShouldScrollToServices] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // Set the token in API headers first
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Try to get user profile to verify token
          const response = await api.get("/auth/profile");

          if (response.data.success) {
            setUser(response.data.user);
          } else {
            // If profile fetch fails, clear token
            localStorage.removeItem("token");
            delete api.defaults.headers.common["Authorization"];
            setUser(null);
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          // Clear invalid token
          localStorage.removeItem("token");
          delete api.defaults.headers.common["Authorization"];
          setUser(null);
        }
      } else {
        // No token found, ensure headers are cleared
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
    // Set token in API headers immediately
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
