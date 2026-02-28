"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface FormData {
  full_name: string;
  email    : string;
  username : string;
  password : string;
  confirm  : string;
}

interface FormErrors {
  full_name?: string;
  email?    : string;
  username? : string;
  password? : string;
  confirm?  : string;
  general?  : string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email    : "",
    username : "",
    password : "",
    confirm  : "",
  });

  const [errors,   setErrors]   = useState<FormErrors>({});
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [success,  setSuccess]  = useState(false);

  // ── Validation ────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = "Full name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = "Only letters, numbers, hyphens and underscores";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    if (!formData.confirm) {
      newErrors.confirm = "Please confirm your password";
    } else if (formData.password !== formData.confirm) {
      newErrors.confirm = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Password Strength ─────────────────────────────────────────
  const getPasswordStrength = (): { label: string; color: string; width: string } => {
    const p = formData.password;
    if (!p) return { label: "", color: "transparent", width: "0%" };

    let score = 0;
    if (p.length >= 8)         score++;
    if (/[A-Z]/.test(p))       score++;
    if (/[0-9]/.test(p))       score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { label: "Weak",   color: "#ef4444", width: "25%" };
    if (score === 2) return { label: "Fair",   color: "#f97316", width: "50%" };
    if (score === 3) return { label: "Good",   color: "#eab308", width: "75%" };
    return               { label: "Strong", color: "#22c55e", width: "100%" };
  };

  const strength = getPasswordStrength();

  // ── Handle Change ─────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // ── Handle Submit ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      // ── Day 16: will connect to API here ──
      console.log("Register:", formData);

      await new Promise(r => setTimeout(r, 1200));
      setSuccess(true);
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // ── Success State ─────────────────────────────────────────────
  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successBox}>
            <div className={styles.successIcon}>🎉</div>
            <h2 className={styles.successTitle}>Account Created!</h2>
            <p className={styles.successMsg}>
              Welcome <strong>{formData.full_name}</strong>!<br />
              Your account is ready.
            </p>
            <Link href="/login" className={styles.successBtn}>
              Sign In Now →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>

      {/* ── Card ── */}
      <div className={styles.card}>

        {/* ── Header ── */}
        <div className={styles.cardHeader}>
          <div className={styles.logo}>🤖</div>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Start practicing interviews with AI today</p>
        </div>

        {/* ── General Error ── */}
        {errors.general && (
          <div className={styles.alertError}>⚠️ {errors.general}</div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* Full Name */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="full_name">Full Name</label>
            <input
              id          = "full_name"
              name        = "full_name"
              type        = "text"
              autoComplete= "name"
              value       = {formData.full_name}
              onChange    = {handleChange}
              placeholder = "John Doe"
              className   = {`${styles.input} ${errors.full_name ? styles.inputError : ""}`}
            />
            {errors.full_name && (
              <span className={styles.errorMsg}>⚠ {errors.full_name}</span>
            )}
          </div>

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email Address</label>
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

          {/* Username */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">Username</label>
            <input
              id          = "username"
              name        = "username"
              type        = "text"
              autoComplete= "username"
              value       = {formData.username}
              onChange    = {handleChange}
              placeholder = "johndoe123"
              className   = {`${styles.input} ${errors.username ? styles.inputError : ""}`}
            />
            {errors.username && (
              <span className={styles.errorMsg}>⚠ {errors.username}</span>
            )}
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <input
                id          = "password"
                name        = "password"
                type        = {showPass ? "text" : "password"}
                autoComplete= "new-password"
                value       = {formData.password}
                onChange    = {handleChange}
                placeholder = "Min 8 chars, 1 uppercase, 1 number"
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

            {/* Strength Bar */}
            {formData.password && (
              <div className={styles.strengthBar}>
                <div
                  className   = {styles.strengthFill}
                  style       = {{ width: strength.width, background: strength.color }}
                />
              </div>
            )}
            {formData.password && (
              <span className={styles.strengthLabel} style={{ color: strength.color }}>
                Strength: {strength.label}
              </span>
            )}
            {errors.password && (
              <span className={styles.errorMsg}>⚠ {errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm">Confirm Password</label>
            <input
              id          = "confirm"
              name        = "confirm"
              type        = {showPass ? "text" : "password"}
              autoComplete= "new-password"
              value       = {formData.confirm}
              onChange    = {handleChange}
              placeholder = "Re-enter your password"
              className   = {`${styles.input} ${errors.confirm ? styles.inputError : ""}`}
            />
            {errors.confirm && (
              <span className={styles.errorMsg}>⚠ {errors.confirm}</span>
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
                Creating account...
              </span>
            ) : (
              "Create Account →"
            )}
          </button>

        </form>

        {/* ── Footer ── */}
        <p className={styles.footerText}>
          Already have an account?{" "}
          <Link href="/login" className={styles.link}>Sign in</Link>
        </p>

      </div>
    </div>
  );
}