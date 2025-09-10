"use client";
import React from "react";
import { BeatLoader } from "react-spinners";

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = 15,
  color = "#3B82F6",
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <BeatLoader color={color} size={size} />
      <p className="mt-4 text-gray-600 text-lg">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
