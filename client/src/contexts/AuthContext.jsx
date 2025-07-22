// AuthContext.jsx - Provides authentication state and functions to the app
import React, {createContext, useContext, useState, useEffect} from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Set up axios interceptor to attach token to requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Use environment variable for API URL
  const API_URL = import.meta.env.VITE_API_URL;

  // Verify token on app load and set user if valid
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/auth/verify`);
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  // Login function - authenticates user and saves token
  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password
    });

    const {token: newToken, user: userData} = response.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);

    return response.data;
  };

  // Register function - creates new user and saves token
  const register = async (username, email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      username,
      email,
      password
    });

    const {token: newToken, user: userData} = response.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);

    return response.data;
  };

  // Logout function - clears token and user
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Value provided to context consumers
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
