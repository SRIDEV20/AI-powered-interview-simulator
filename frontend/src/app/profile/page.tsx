"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  getUserStats,
  updateUserProfile,
  UserStats,
  UpdateProfileData,
} from "@/lib/api";
import styles from "./page.module.css";

// ── Helpers ────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function getScoreColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#6ea8fe";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, token, refreshUser } = useAuth();    // ✅ refreshUser (not login)

  const [stats,    setStats]    = useState<UserStats | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState<string | null>(null);

  // ── Form state ────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    full_name : user?.full_name ?? "",
    username  : user?.username  ?? "",
    email     : user?.email     ?? "",
  });

  const [formErrors, setFormErrors] = useState({
    full_name : "",
    username  : "",
    email     : "",
  });

  // ── Fetch stats ───────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const fetchStats = async () => {
      try {
        const data = await getUserStats(token);
        setStats(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  // ── Sync form when user changes ───────────────────────────────
  useEffect(() => {
    if (user) {
      setFormData({
        full_name : user.full_name,
        username  : user.username,
        email     : user.email,
      });
    }
  }, [user]);

  // ── Validation ────────────────────────────────────────────────
  const validate = (): boolean => {
    const errors = { full_name: "", username: "", email: "" };
    let valid = true;

    if (!formData.full_name.trim()) {
      errors.full_name = "Full name is required"; valid = false;
    } else if (formData.full_name.trim().length < 2) {
      errors.full_name = "Min 2 characters"; valid = false;
    }

    if (!formData.username.trim()) {
      errors.username = "Username is required"; valid = false;
    } else if (formData.username.length < 3) {
      errors.username = "Min 3 characters"; valid = false;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = "Only letters, numbers, hyphens, underscores"; valid = false;
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"; valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format"; valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  // ── Handle Change ─────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  // ── Handle Save ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate() || !token) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated: UpdateProfileData = {
        full_name : formData.full_name,
        username  : formData.username,
        email     : formData.email,
      };

      await updateUserProfile(token, updated);
      await refreshUser();                           // ✅ refresh user in context

      setSuccess("✅ Profile updated successfully!");
      setEditMode(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ── Handle Cancel ─────────────────────────────────────────────
  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name : user.full_name,
        username  : user.username,
        email     : user.email,
      });
    }
    setFormErrors({ full_name: "", username: "", email: "" });
    setError(null);
    setEditMode(false);
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <div className={styles.page}>
        <div className="container">

          {/* ── Page Title ── */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>My Profile</h1>
            <p className={styles.pageSub}>Manage your account information</p>
          </div>

          <div className={styles.layout}>

            {/* ══ LEFT - Profile Card ══════════════════════════════ */}
            <div className={styles.profileCard}>

              {/* Avatar */}
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  {user ? getInitials(user.full_name) : "?"}
                </div>
                <div className={styles.avatarInfo}>
                  <div className={styles.avatarName}>{user?.full_name}</div>
                  <div className={styles.avatarUsername}>@{user?.username}</div>
                  <div className={styles.activeBadge}>● Active</div>
                </div>
              </div>

              <hr className={styles.divider} />

              {/* ── Alerts ── */}
              {error && (
                <div className={styles.alertError}>⚠️ {error}</div>
              )}
              {success && (
                <div className={styles.alertSuccess}>{success}</div>
              )}

              {/* ── View / Edit Form ── */}
              <div className={styles.fieldsSection}>

                {/* Full Name */}
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Full Name</label>
                  {editMode ? (
                    <>
                      <input
                        name        = "full_name"
                        value       = {formData.full_name}
                        onChange    = {handleChange}
                        className   = {`${styles.input} ${formErrors.full_name ? styles.inputError : ""}`}
                        placeholder = "Your full name"
                      />
                      {formErrors.full_name && (
                        <span className={styles.fieldError}>⚠ {formErrors.full_name}</span>
                      )}
                    </>
                  ) : (
                    <div className={styles.fieldValue}>{user?.full_name}</div>
                  )}
                </div>

                {/* Username */}
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Username</label>
                  {editMode ? (
                    <>
                      <input
                        name        = "username"
                        value       = {formData.username}
                        onChange    = {handleChange}
                        className   = {`${styles.input} ${formErrors.username ? styles.inputError : ""}`}
                        placeholder = "your_username"
                      />
                      {formErrors.username && (
                        <span className={styles.fieldError}>⚠ {formErrors.username}</span>
                      )}
                    </>
                  ) : (
                    <div className={styles.fieldValue}>@{user?.username}</div>
                  )}
                </div>

                {/* Email */}
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Email Address</label>
                  {editMode ? (
                    <>
                      <input
                        name        = "email"
                        type        = "email"
                        value       = {formData.email}
                        onChange    = {handleChange}
                        className   = {`${styles.input} ${formErrors.email ? styles.inputError : ""}`}
                        placeholder = "you@example.com"
                      />
                      {formErrors.email && (
                        <span className={styles.fieldError}>⚠ {formErrors.email}</span>
                      )}
                    </>
                  ) : (
                    <div className={styles.fieldValue}>{user?.email}</div>
                  )}
                </div>

                {/* Member Since (always view) */}
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Member Since</label>
                  <div className={styles.fieldValue}>
                    {user?.created_at ? formatDate(user.created_at) : "—"}
                  </div>
                </div>

              </div>

              {/* ── Action Buttons ── */}
              <div className={styles.actions}>
                {editMode ? (
                  <>
                    <button
                      onClick   = {handleSave}
                      disabled  = {saving}
                      className = {`${styles.saveBtn} ${saving ? styles.saveBtnLoading : ""}`}
                    >
                      {saving ? (
                        <span className={styles.loadingRow}>
                          <span className={styles.spinner} /> Saving...
                        </span>
                      ) : "Save Changes"}
                    </button>
                    <button
                      onClick   = {handleCancel}
                      disabled  = {saving}
                      className = {styles.cancelBtn}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick   = {() => setEditMode(true)}
                    className = {styles.editBtn}
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

            </div>

            {/* ══ RIGHT - Stats Card ════════════════════════════════ */}
            <div className={styles.statsCard}>

              <h2 className={styles.statsTitle}>📊 Your Stats</h2>

              {loading ? (
                <div className={styles.statsLoading}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={styles.skeletonStat} />
                  ))}
                </div>
              ) : stats ? (
                <div className={styles.statsList}>

                  <div className={styles.statRow}>
                    <span className={styles.statRowLabel}>🎯 Total Interviews</span>
                    <span className={styles.statRowValue}>{stats.total_interviews}</span>
                  </div>

                  <div className={styles.statRow}>
                    <span className={styles.statRowLabel}>✅ Completed</span>
                    <span className={styles.statRowValue}>{stats.completed_interviews}</span>
                  </div>

                  <div className={styles.statRow}>
                    <span className={styles.statRowLabel}>📈 Average Score</span>
                    <span
                      className={styles.statRowValue}
                      style={{ color: stats.average_score > 0
                        ? getScoreColor(stats.average_score)
                        : "var(--muted)" }}
                    >
                      {stats.average_score > 0
                        ? `${stats.average_score.toFixed(1)}%`
                        : "—"}
                    </span>
                  </div>

                  <div className={styles.statRow}>
                    <span className={styles.statRowLabel}>🏆 Best Score</span>
                    <span
                      className={styles.statRowValue}
                      style={{ color: stats.best_score > 0
                        ? getScoreColor(stats.best_score)
                        : "var(--muted)" }}
                    >
                      {stats.best_score > 0
                        ? `${stats.best_score.toFixed(1)}%`
                        : "—"}
                    </span>
                  </div>

                  <div className={styles.statRow}>
                    <span className={styles.statRowLabel}>💬 Questions Answered</span>
                    <span className={styles.statRowValue}>
                      {stats.total_questions_answered}
                    </span>
                  </div>

                  <hr className={styles.statsDivider} />

                  <div className={styles.statRow}>
                    <span className={styles.statRowLabel}>📅 Member Since</span>
                    <span className={styles.statRowValue} style={{ fontSize: "0.8rem" }}>
                      {formatDate(stats.member_since)}
                    </span>
                  </div>

                  <div className={styles.statRow}>
                    <span className={styles.statRowLabel}>🔒 Account Status</span>
                    <span className={styles.activePill}>● {stats.account_status}</span>
                  </div>

                </div>
              ) : (
                <p className={styles.noStats}>No stats available yet.</p>
              )}

              {/* ── Quick Links ── */}
              <div className={styles.quickLinks}>
                <h3 className={styles.quickTitle}>Quick Actions</h3>
                <Link href="/dashboard" className={styles.quickLink}>📋 View Dashboard</Link>
                <Link href="/interview/setup" className={styles.quickLink}>🎤 New Interview</Link>
              </div>

            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}