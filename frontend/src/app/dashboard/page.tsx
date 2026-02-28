"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <div style={{
        minHeight      : "100vh",
        display        : "flex",
        flexDirection  : "column",
        alignItems     : "center",
        justifyContent : "center",
        gap            : "24px",
        padding        : "24px",
      }}>
        <div style={{ fontSize: "3rem" }}>🎉</div>

        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text)" }}>
          Welcome, {user?.full_name}!
        </h1>

        <p style={{ color: "var(--muted)", fontSize: "1rem" }}>
          ✅ You are logged in as <strong style={{ color: "var(--brand)" }}>@{user?.username}</strong>
        </p>

        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          📧 {user?.email}
        </p>

        <p style={{
          color      : "var(--muted)",
          fontSize   : "0.85rem",
          background : "rgba(110,168,254,0.08)",
          border     : "1px solid rgba(110,168,254,0.2)",
          borderRadius: "10px",
          padding    : "12px 20px",
        }}>
          🚧 Full dashboard coming on <strong style={{ color: "var(--brand)" }}>Day 17</strong>
        </p>

        <button
          onClick   = {handleLogout}
          style={{
            padding      : "10px 28px",
            background   : "rgba(239,68,68,0.15)",
            border       : "1px solid rgba(239,68,68,0.3)",
            borderRadius : "10px",
            color        : "#f87171",
            cursor       : "pointer",
            fontSize     : "0.9rem",
            fontWeight   : 600,
            transition   : "opacity 0.2s",
          }}
        >
          Logout
        </button>

      </div>
    </ProtectedRoute>
  );
}