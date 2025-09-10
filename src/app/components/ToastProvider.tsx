"use client";
import { Toaster } from "react-hot-toast";

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
        },
        // Success toast styling
        success: {
          duration: 3000,
          style: {
            background: "#10B981",
            color: "#fff",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#10B981",
          },
        },
        // Error toast styling
        error: {
          duration: 5000,
          style: {
            background: "#EF4444",
            color: "#fff",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        },
        // Loading toast styling
        loading: {
          style: {
            background: "#3B82F6",
            color: "#fff",
          },
        },
      }}
    />
  );
};

export default ToastProvider;
