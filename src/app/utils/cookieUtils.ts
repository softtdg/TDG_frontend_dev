import Cookies from "js-cookie";

// Cookie configuration
const COOKIE_CONFIG = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production", // Only secure in production
  sameSite: "strict" as const,
  path: "/",
};

// Cookie keys
export const COOKIE_KEYS = {
  AUTH_TOKEN: "auth_token",
  IS_LOGGED_IN: "is_logged_in",
  USER_DATA: "user_data",
} as const;

// Token management functions
export const setAuthToken = (token: string): void => {
  Cookies.set(COOKIE_KEYS.AUTH_TOKEN, token, COOKIE_CONFIG);
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get(COOKIE_KEYS.AUTH_TOKEN);
};

export const removeAuthToken = (): void => {
  Cookies.remove(COOKIE_KEYS.AUTH_TOKEN, { path: "/" });
};

// Login status management
export const setLoginStatus = (isLoggedIn: boolean): void => {
  Cookies.set(COOKIE_KEYS.IS_LOGGED_IN, isLoggedIn.toString(), COOKIE_CONFIG);
};

export const getLoginStatus = (): boolean => {
  const status = Cookies.get(COOKIE_KEYS.IS_LOGGED_IN);
  return status === "true";
};

export const removeLoginStatus = (): void => {
  Cookies.remove(COOKIE_KEYS.IS_LOGGED_IN, { path: "/" });
};

// User data management
export const setUserData = (userData: any): void => {
  Cookies.set(COOKIE_KEYS.USER_DATA, JSON.stringify(userData), COOKIE_CONFIG);
};

export const getUserData = (): any => {
  const userData = Cookies.get(COOKIE_KEYS.USER_DATA);
  return userData ? JSON.parse(userData) : null;
};

export const removeUserData = (): void => {
  Cookies.remove(COOKIE_KEYS.USER_DATA, { path: "/" });
};

// Complete logout function
export const clearAllAuthData = (): void => {
  removeAuthToken();
  removeLoginStatus();
  removeUserData();
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const isLoggedIn = getLoginStatus();
  return !!(token && isLoggedIn);
};

// Set complete authentication data
export const setAuthData = (token: string, userData?: any): void => {
  setAuthToken(token);
  setLoginStatus(true);
  if (userData) {
    setUserData(userData);
  }
};
