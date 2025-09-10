import React from "react";
import { clearAllAuthData, isAuthenticated } from "./cookieUtils";
import toast from "react-hot-toast";

// Logout function
export const logout = (): void => {
  clearAllAuthData();

  // Show logout toast
  toast.success("Logged out successfully");

  // Dispatch event to notify components
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("authStateChange"));
  }
};

// Check authentication status
export const checkAuthStatus = (): boolean => {
  return isAuthenticated();
};

// Protected route wrapper
export const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  return function AuthenticatedComponent(props: any) {
    const [isAuth, setIsAuth] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      const checkAuth = () => {
        const authenticated = checkAuthStatus();
        setIsAuth(authenticated);
        setLoading(false);

        if (!authenticated) {
          logout();
        }
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

    if (loading) {
      return React.createElement("div", null, "Loading..."); // You can replace this with a proper loading component
    }

    if (!isAuth) {
      return null; // Will redirect to login
    }

    return React.createElement(WrappedComponent, props);
  };
};
