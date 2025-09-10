"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  isAuthenticated,
  getAuthToken,
  getUserData,
  clearAllAuthData,
} from "../utils/cookieUtils";

interface AuthContextType {
  isAuth: boolean;
  token: string | undefined;
  userData: any;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
  initialAuth?: boolean;
  initialToken?: string;
  initialUserData?: any;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialAuth = false,
  initialToken,
  initialUserData,
}) => {
  const [isAuth, setIsAuth] = useState(initialAuth);
  const [token, setToken] = useState<string | undefined>(initialToken);
  const [userData, setUserData] = useState<any>(initialUserData);
  const [loading, setLoading] = useState(false); // Start with false since we have initial values

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const authToken = getAuthToken();
      const user = getUserData();

      setIsAuth(authenticated);
      setToken(authToken);
      setUserData(user);
      setLoading(false);
    };

    // If we don't have initial values, check auth state immediately
    if (!initialAuth && !initialToken) {
      setLoading(true);
      checkAuth();
    }

    // Always listen for auth state changes (for logout/login events)
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("authStateChange", handleAuthChange);

    return () => {
      window.removeEventListener("authStateChange", handleAuthChange);
    };
  }, [initialAuth, initialToken]);

  const logout = () => {
    // Clear auth data
    clearAllAuthData();

    // Update local state immediately
    setIsAuth(false);
    setToken(undefined);
    setUserData(null);

    // Show logout toast
    // const toast = require("react-hot-toast");
    // toast.success("Logged out successfully");

    // Dispatch event to notify other components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("authStateChange"));
    }
  };

  const value: AuthContextType = {
    isAuth,
    token,
    userData,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
