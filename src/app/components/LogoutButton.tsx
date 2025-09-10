"use client";
import React from "react";
import { useAuth } from "../providers/AuthProvider";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  className = "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded",
  children = "Logout",
}) => {
  const { logout, isAuth } = useAuth();

  if (!isAuth) {
    return null;
  }

  return (
    <button onClick={logout} className={className} type="button">
      {children}
    </button>
  );
};

export default LogoutButton;
