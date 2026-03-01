"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getUserStats, getInterviewList, UserStats, InterviewSummary } from "@/lib/api";
import styles from "./page.module.css";

// ── Helpers ────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function getDifficultyColor(d: string): string {
  if (d === "beginner")     return "#22c55e";
  if (d === "intermediate") return "#eab308";
  if (d === "advanced")     return "#ef4444";
  return "var(--muted)";
}

function getStatusColor(s: string): string {
  if (s === "completed")   return "#22c55e";
  if (s === "in_progress") return "#6ea8fe";
  if (s === "abandoned")   return "#ef4444";
  return "var(--muted)";
}

function getScoreColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#6ea8fe";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

// ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, token } = useAuth();

  const [stats,      setStats]      = useState<UserStats | null>(null);
  const [interviews, setInterviews] = useState<InterviewSummary[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  // ── Fetch data ──────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, listData] = await Promise.all([
          getUserStats(token),
          getInterviewList(token),
        ]);
        setStats(statsData);
        setInterviews(listData.interviews);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // ─────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <div className={styles.page}>
        <div className="container">

          {/* ── Welcome ── */}
          <div className={styles.welcome}>
            <div>
              <h1 className={styles.welcomeTitle}>
                Welcome back, <span className={styles.name}>{user?.full_name}</span> 👋
              </h1>
              <p className={styles.welcomeSub}>
                Ready to practice? Let&apos;s sharpen your interview skills today.
              </p>
            </div>
            <Link href="/interview/setup" className={styles.newBtn}>
              + New Interview
            </Link>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className={styles.errorBox}>⚠️ {error}</div>
          )}

          {/* ── Stats Cards ── */}
          {loading ? (
            <div className={styles.loadingRow}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : stats && (
            <div className={styles.statsGrid}>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>🎯</div>
                <div className={styles.statValue}>{stats.total_interviews}</div>
                <div className={styles.statLabel}>Total Interviews</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>✅</div>
                <div className={styles.statValue}>{stats.completed_interviews}</div>
                <div className={styles.statLabel}>Completed</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>📊</div>
                <div
                  className={styles.statValue}
                  style={{ color: stats.average_score > 0 ? getScoreColor(stats.average_score) : "var(--muted)" }}
                >
                  {stats.average_score > 0 ? `${stats.average_score.toFixed(1)}%` : "—"}
                </div>
                <div className={styles.statLabel}>Average Score</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>🏆</div>
                <div
                  className={styles.statValue}
                  style={{ color: stats.best_score > 0 ? getScoreColor(stats.best_score) : "var(--muted)" }}
                >
                  {stats.best_score > 0 ? `${stats.best_score.toFixed(1)}%` : "—"}
                </div>
                <div className={styles.statLabel}>Best Score</div>
              </div>

            </div>
          )}

          {/* ── Interview History ── */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Interview History</h2>
              <span className={styles.sectionCount}>
                {interviews.length} interview{interviews.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <div className={styles.historyList}>
                {[1, 2, 3].map(i => (
                  <div key={i} className={styles.skeletonRow} />
                ))}
              </div>
            ) : interviews.length === 0 ? (
              /* ── Empty State ── */
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🎤</div>
                <h3 className={styles.emptyTitle}>No interviews yet</h3>
                <p className={styles.emptyMsg}>
                  Start your first AI-powered interview and get instant feedback!
                </p>
                <Link href="/interview/setup" className={styles.emptyBtn}>
                  Start First Interview →
                </Link>
              </div>
            ) : (
              /* ── Interview List ── */
              <div className={styles.historyList}>
                {interviews.map((iv) => (
                  <div key={iv.interview_id} className={styles.historyCard}>

                    {/* Left */}
                    <div className={styles.historyLeft}>
                      <div className={styles.historyRole}>{iv.job_role}</div>
                      <div className={styles.historyMeta}>
                        <span
                          className={styles.badge}
                          style={{ color: getDifficultyColor(iv.difficulty),
                                   borderColor: getDifficultyColor(iv.difficulty) + "44",
                                   background : getDifficultyColor(iv.difficulty) + "15" }}
                        >
                          {iv.difficulty}
                        </span>
                        <span className={styles.metaDot}>·</span>
                        <span className={styles.metaText}>{iv.total_questions} questions</span>
                        <span className={styles.metaDot}>·</span>
                        <span className={styles.metaText}>{formatDate(iv.created_at)}</span>
                      </div>
                    </div>

                    {/* Right */}
                    <div className={styles.historyRight}>
                      {/* Score */}
                      <div className={styles.scoreBox}>
                        {iv.overall_score !== null ? (
                          <span
                            className={styles.score}
                            style={{ color: getScoreColor(iv.overall_score) }}
                          >
                            {iv.overall_score.toFixed(1)}%
                          </span>
                        ) : (
                          <span className={styles.scorePending}>—</span>
                        )}
                      </div>

                      {/* Status badge */}
                      <span
                        className={styles.statusBadge}
                        style={{ color: getStatusColor(iv.status),
                                 borderColor: getStatusColor(iv.status) + "44",
                                 background : getStatusColor(iv.status) + "15" }}
                      >
                        {iv.status === "in_progress" ? "In Progress" :
                         iv.status === "completed"   ? "Completed"   : "Abandoned"}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer info ── */}
          <div className={styles.footerInfo}>
            <span>Member since {stats ? formatDate(stats.member_since) : "—"}</span>
            <span>·</span>
            <span>{stats?.total_questions_answered ?? 0} questions answered</span>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}