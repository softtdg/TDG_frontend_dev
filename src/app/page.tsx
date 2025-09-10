"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import QueryProvider from "./services/queryProvider/queryprovider";
import Login from "./Authentication/login/page";
import DashboardComponent from "./components/pages/dashboard/page";
import LoadingSpinner from "./components/LoadingSpinner";
import { useAuth } from "./providers/AuthProvider";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const queryClient = new QueryClient();

export default function Home() {
  const { isAuth, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Initializing..." />;
  }

  return isAuth ? <DashboardComponent /> : <Login />;
}
