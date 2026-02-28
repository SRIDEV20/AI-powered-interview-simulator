"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface FormData {
  email   : string;
  password: string;
}

interface FormErrors {
  email?   : string;
  password?: string;
  general? : string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email   : "",
    password: "",
  });

  const [errors,    setErrors]    = useState<FormErrors>({});
  const [loading,   setLoading]   = useState(false);
  const [showPass,  setShowPass]  = useState(false);

  // ── Validation ─────────────────────────────────────���────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Handle Change ────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error on change
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // ── Handle Submit ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      // ── Day 16: will connect to API here ──
      console.log("Login:", formData);

      // Simulate loading for now
      await new Promise(r => setTimeout(r, 1000));

      alert("✅ Day 16 will connect this to the real API!");
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>

      {/* ── Card ── */}
      <div className={styles.card}>

        {/* ── Header ── */}
        <div className={styles.cardHeader}>
          <div className={styles.logo}>🤖</div>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to continue your interview practice</p>
        </div>

        {/* ── General Error ── */}
        {errors.general && (
          <div className={styles.alertError}>
            ⚠️ {errors.general}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email Address
            </label>
            <input
              id          = "email"
              name        = "email"
              type        = "email"
              autoComplete= "email"
              value       = {formData.email}
              onChange    = {handleChange}
              placeholder = "you@example.com"
              className   = {`${styles.input} ${errors.email ? styles.inputError : ""}`}
            />
            {errors.email && (
              <span className={styles.errorMsg}>⚠ {errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id          = "password"
                name        = "password"
                type        = {showPass ? "text" : "password"}
                autoComplete= "current-password"
                value       = {formData.password}
                onChange    = {handleChange}
                placeholder = "Enter your password"
                className   = {`${styles.input} ${errors.password ? styles.inputError : ""}`}
              />
              <button
                type      = "button"
                className = {styles.eyeBtn}
                onClick   = {() => setShowPass(p => !p)}
                tabIndex  = {-1}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && (
              <span className={styles.errorMsg}>⚠ {errors.password}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type      = "submit"
            disabled  = {loading}
            className = {`${styles.submitBtn} ${loading ? styles.submitBtnLoading : ""}`}
          >
            {loading ? (
              <span className={styles.loadingRow}>
                <span className={styles.spinner} />
                Signing in...
              </span>
            ) : (
              "Sign In →"
            )}
          </button>

        </form>

        {/* ── Footer ── */}
        <p className={styles.footerText}>
          Don&apos;t have an account?{" "}
          <Link href="/register" className={styles.link}>
            Create one free
          </Link>
        </p>

      </div>
    </div>
  );
}