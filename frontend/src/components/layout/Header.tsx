"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./Header.module.css";

export default function Header() {
  const { isAuth, user, logout } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();

  // Don't show header on auth pages
  const hideHeader = pathname === "/login" || pathname === "/register";
  if (hideHeader) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.inner}>

          {/* Brand */}
          <Link href={isAuth ? "/dashboard" : "/"} className={styles.brand}>
            🤖 AI Interview Simulator
          </Link>

          {/* Nav */}
          <nav className={styles.nav}>
            {isAuth ? (
              // ── Logged in nav ──
              <>
                <Link
                  href="/dashboard"
                  className={`${styles.navLink} ${pathname === "/dashboard" ? styles.navLinkActive : ""}`}
                >
                  Dashboard
                </Link>

                <span className={styles.divider}>|</span>

                <span className={styles.username}>@{user?.username}</span>

                <button
                  onClick   = {handleLogout}
                  className = {styles.logoutBtn}
                >
                  Logout
                </button>
              </>
            ) : (
              // ── Logged out nav ──
              <>
                <a href="#features" className={styles.navLink}>Features</a>
                <a href="#how"      className={styles.navLink}>How it works</a>
                <Link href="/login"    className={styles.navLink}>Login</Link>
                <Link href="/register" className={styles.signupBtn}>Sign Up</Link>
              </>
            )}
          </nav>

        </div>
      </div>
    </header>
  );
}