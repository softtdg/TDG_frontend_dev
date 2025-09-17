"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import QueryProvider from "./services/queryProvider/queryprovider";
import LoadingSpinner from "./components/LoadingSpinner";
import { useAuth } from "./providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const queryClient = new QueryClient();

export default function Home() {
  const { isAuth, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuth) {
        router.push("/sop-search");
      } else {
        router.push("/login");
      }
    }
  }, [isAuth, loading, router]);

  if (loading) {
    return <LoadingSpinner message="Initializing..." />;
  }

  return <LoadingSpinner message="Redirecting..." />;
}
