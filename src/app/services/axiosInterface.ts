import axios from "axios";
import {
  getAuthToken,
  setAuthToken,
  isAuthenticated,
  clearAllAuthData,
} from "../utils/cookieUtils";

export const AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Request interceptor to add auth token to all requests
AxiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.authentication = `${token}`;
    } else {
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
AxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Check if this endpoint should bypass automatic logout
      const url = error.config?.url || "";
      const isLoginEndpoint = url.includes("/auth/login");
      const isSopSearchEndpoint = url.includes("/sopSearch/");

      // Don't auto-logout for login endpoints or SOP search endpoints
      if (!isLoginEndpoint && !isSopSearchEndpoint) {
        // Only logout if user was actually authenticated
        if (isAuthenticated()) {
          // User was authenticated but token is now invalid, clear auth data
          clearAllAuthData();
          // Redirect to login page
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      }
      // For login and SOP search endpoints, just let the error pass through
    }
    return Promise.reject(error);
  }
);

// Utility functions for token management
export const setAuthTokenInAxios = (token: string) => {
  setAuthToken(token);
};

export const getCurrentToken = () => {
  return getAuthToken();
};

export const verifyTokenInHeaders = () => {
  const token = getAuthToken();
  return !!token;
};

// Function to manually add token to a specific request
export const addTokenToRequest = (config: any) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
