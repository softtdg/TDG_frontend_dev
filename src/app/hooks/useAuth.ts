import { useState, useEffect } from "react";
import {
  isAuthenticated,
  getAuthToken,
  getUserData,
} from "../utils/cookieUtils";
import { logout } from "../utils/authUtils";

export const useAuth = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

    checkAuth();

    // Listen for auth state changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("authStateChange", handleAuthChange);

    return () => {
      window.removeEventListener("authStateChange", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  return {
    isAuth,
    token,
    userData,
    loading,
    logout: handleLogout,
  };
};
