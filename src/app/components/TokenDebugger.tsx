"use client";
import React from "react";
import {
  getCurrentToken,
  verifyTokenInHeaders,
} from "../services/axiosInterface";
import { useAuth } from "../providers/AuthProvider";

const TokenDebugger: React.FC = () => {
  const { isAuth, token, userData } = useAuth();

  const handleVerifyToken = () => {
    verifyTokenInHeaders();
  };

  const handleShowToken = () => {
    const currentToken = getCurrentToken();
    alert(
      `Token: ${
        currentToken ? currentToken.substring(0, 30) + "..." : "No token"
      }`
    );
  };

  if (!isAuth) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <p className="text-yellow-800">Not authenticated</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded">
      <h3 className="text-blue-800 font-bold mb-2">🔑 Token Debugger</h3>
      <div className="space-y-2">
        <p className="text-blue-700">
          <strong>Auth Status:</strong>{" "}
          {isAuth ? "✅ Authenticated" : "❌ Not authenticated"}
        </p>
        <p className="text-blue-700">
          <strong>Token Length:</strong> {token?.length || 0} characters
        </p>
        <p className="text-blue-700">
          <strong>Token Preview:</strong>{" "}
          {token ? token.substring(0, 20) + "..." : "No token"}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleVerifyToken}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Verify Token
          </button>
          <button
            onClick={handleShowToken}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Show Token
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenDebugger;
