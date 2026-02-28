"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuth, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuth) {
      router.replace("/login");
    }
  }, [isAuth, loading, router]);

  // Show nothing while checking auth
  if (loading) {
    return (
      <div style={{
        minHeight      : "100vh",
        display        : "flex",
        alignItems     : "center",
        justifyContent : "center",
        color          : "var(--muted)",
        fontSize       : "0.95rem",
      }}>
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuth) return null;

  return <>{children}</>;
}