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

  const isActive = (path: string) => pathname === path;

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
              <>
                <Link
                  href="/dashboard"
                  className={`${styles.navLink} ${isActive("/dashboard") ? styles.navLinkActive : ""}`}
                >
                  Dashboard
                </Link>

                <Link
                  href="/profile"
                  className={`${styles.navLink} ${isActive("/profile") ? styles.navLinkActive : ""}`}
                >
                  Profile
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