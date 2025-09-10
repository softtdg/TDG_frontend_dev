import toast from "react-hot-toast";

// Toast utility functions for consistent messaging
export const toastUtils = {
  // Success messages
  success: (message: string) => {
    toast.success(message);
  },

  // Error messages
  error: (message: string) => {
    toast.error(message);
  },

  // API Error messages (handles API errors automatically)
  apiError: (error: any, defaultMessage: string = "An error occurred") => {
    let errorMessage = defaultMessage;

    // Handle different error formats
    if (typeof error === "string") {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.error) {
      errorMessage = error.error;
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    toast.error(errorMessage);
  },

  // Loading messages
  loading: (message: string) => {
    return toast.loading(message);
  },

  // Info messages
  info: (message: string) => {
    toast(message, {
      icon: "ℹ️",
      style: {
        background: "#3B82F6",
        color: "#fff",
      },
    });
  },

  // Warning messages
  warning: (message: string) => {
    toast(message, {
      icon: "⚠️",
      style: {
        background: "#F59E0B",
        color: "#fff",
      },
    });
  },

  // Promise-based toast (for async operations)
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },

  // Dismiss all toasts
  dismiss: () => {
    toast.dismiss();
  },

  // Dismiss specific toast
  dismissSpecific: (toastId: string) => {
    toast.dismiss(toastId);
  },
};

// Common toast messages
export const toastMessages = {
  login: {
    success: "Login successful! Redirecting...",
    error: "Login failed. Please check your credentials.",
    loading: "Logging in...",
    invalidCredentials:
      "Invalid credentials. Please check your username and password.",
    networkError: "Network error. Please check your connection.",
    serverError: "Server error. Please try again later.",
  },
  sop: {
    success: "SOP found successfully!",
    notFound: "SOP not found. Please check the SOP number.",
    error: "Error searching for SOP. Please try again.",
    loading: "Searching for SOP...",
    empty: "Please enter a SOP number",
  },
  auth: {
    logout: "Logged out successfully",
    sessionExpired: "Session expired. Please login again.",
    unauthorized: "Authentication failed. Please login again.",
  },
  general: {
    success: "Operation completed successfully!",
    error: "Something went wrong. Please try again.",
    loading: "Processing...",
    validation: "Please fill in all required fields",
  },
};

export default toastUtils;
