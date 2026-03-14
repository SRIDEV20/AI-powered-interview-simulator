"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  getUserSkillGaps,
  UserSkillGapsResponse,
  SkillGapItem,
} from "@/lib/api";
import styles from "./page.module.css";

// ── Helpers ────────────────────────────────────────────────────────
function getLevelColor(level: string): string {
  if (level === "strong")   return "#22c55e";
  if (level === "moderate") return "#eab308";
  return "#ef4444";
}

function getLevelBg(level: string): string {
  if (level === "strong")   return "rgba(34,197,94,0.1)";
  if (level === "moderate") return "rgba(234,179,8,0.1)";
  return "rgba(239,68,68,0.1)";
}

function getLevelIcon(level: string): string {
  if (level === "strong")   return "💪";
  if (level === "moderate") return "📈";
  return "⚠️";
}

function getLevelLabel(level: string): string {
  if (level === "strong")   return "Strong";
  if (level === "moderate") return "Moderate";
  return "Weak";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day  : "numeric",
    year : "numeric",
  });
}

// ── Skill Bar Component ────────────────────────────────────────────
function SkillBar({ gap }: { gap: SkillGapItem }) {
  const color = getLevelColor(gap.proficiency_level);
  const bg    = getLevelBg(gap.proficiency_level);
  const icon  = getLevelIcon(gap.proficiency_level);
  const label = getLevelLabel(gap.proficiency_level);

  return (
    <div className={styles.skillCard}>

      {/* Header */}
      <div className={styles.skillHeader}>
        <div className={styles.skillLeft}>
          <span className={styles.skillIcon}>{icon}</span>
          <div className={styles.skillInfo}>
            <span className={styles.skillName}>{gap.skill_name}</span>
            <span className={styles.skillDate}>
              Identified {formatDate(gap.identified_at)}
            </span>
          </div>
        </div>
        <div className={styles.skillRight}>
          <span
            className={styles.skillBadge}
            style={{ color, background: bg, border: `1px solid ${color}40` }}
          >
            {label}
          </span>
          <span className={styles.skillScore} style={{ color }}>
            {gap.gap_score.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.barBg}>
        <div
          className={styles.barFill}
          style={{ width: `${gap.gap_score}%`, background: color }}
        />
        {/* Threshold markers */}
        <div className={styles.marker} style={{ left: "50%" }} />
        <div className={styles.marker} style={{ left: "75%" }} />
      </div>

      {/* Marker Labels */}
      <div className={styles.markerLabels}>
        <span>0</span>
        <span style={{ marginLeft: "48%" }}>50</span>
        <span style={{ marginLeft: "23%" }}>75</span>
        <span>100</span>
      </div>

      {/* Recommendation */}
      {gap.recommendation && (
        <div className={styles.recommendation}>
          <span className={styles.recIcon}>💡</span>
          <p className={styles.recText}>{gap.recommendation}</p>
        </div>
      )}

    </div>
  );
}

// ── Skeleton Components (Day 25) ───────────────────────────────────
function SummarySkeleton() {
  return (
    <div className={styles.summaryGrid}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.skeletonCard} />
      ))}
    </div>
  );
}

function SkillCardSkeletonList() {
  return (
    <div className={styles.skillsList}>
      {[1, 2, 3].map((i) => (
        <div key={i} className={styles.skeletonSkillCard} />
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function SkillGapsPage() {
  const { token }  = useAuth();
  const router     = useRouter();

  const [data,       setData]       = useState<UserSkillGapsResponse | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [filter,     setFilter]     = useState<"all" | "weak" | "moderate" | "strong">("all");
  const [refreshing, setRefreshing] = useState(false);

  // Day 25: cache skill gaps (avoid refetch on every navigation)
  const CACHE_KEY = "ai_skill_gaps_cache_v1";
  const CACHE_TTL_MS = 60 * 1000; // 60 seconds

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setError(null);

      // 1) Try cache first for instant UI
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { ts: number; data: UserSkillGapsResponse };
          if (parsed?.ts && parsed?.data) {
            const fresh = Date.now() - parsed.ts < CACHE_TTL_MS;
            if (fresh) {
              setData(parsed.data);
              setLoading(false);
              // Still do a background refresh (fast + keeps it correct)
              setRefreshing(true);
            }
          }
        }
      } catch {
        // ignore cache parse errors
      }

      // 2) Network fetch (source of truth)
      try {
        const result = await getUserSkillGaps(token);
        setData(result);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: result }));
        } catch {
          // ignore storage failures
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load skill gaps");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    load();
  }, [token]);

  // ── Filter ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return data?.skill_gaps.filter((g) =>
      filter === "all" ? true : g.proficiency_level === filter
    ) ?? [];
  }, [data, filter]);

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <ProtectedRoute>
        <div className={styles.page}>
          <div className={styles.container}>

            <div className={styles.pageHeader}>
              <button
                className={styles.backLink}
                onClick={() => router.push("/dashboard")}
              >
                ← Dashboard
              </button>
              <h1 className={styles.pageTitle}>🎯 Skill Gap Analysis</h1>
              <p className={styles.pageSub}>
                Track your strengths and areas for improvement across all interviews
              </p>
            </div>

            <SummarySkeleton />
            <div className={styles.overviewCard}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonBar} />
              <div className={styles.skeletonLegend} />
              <div className={styles.skeletonMiniGrid} />
            </div>

            <div className={styles.filterRow}>
              {["All", "Weak", "Moderate", "Strong"].map((t) => (
                <div key={t} className={styles.skeletonPill} />
              ))}
            </div>

            <SkillCardSkeletonList />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (error) {
    return (
      <ProtectedRoute>
        <div className={styles.centerPage}>
          <div className={styles.errorBox}>⚠️ {error}</div>
          <button
            className={styles.backBtn}
            onClick={() => router.push("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  // ── Empty State ──────────────────────────────────────────────
  if (!data || data.total_gaps === 0) {
    return (
      <ProtectedRoute>
        <div className={styles.centerPage}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>🎯</div>
            <h2 className={styles.emptyTitle}>No Skill Gaps Yet</h2>
            <p className={styles.emptyText}>
              Complete an interview and analyze it to see your skill gaps!
            </p>
            <button
              className={styles.startBtn}
              onClick={() => router.push("/interview/setup")}
            >
              🚀 Start Your First Interview
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <div className={styles.page}>
        <div className={styles.container}>

          {/* ── Page Header ── */}
          <div className={styles.pageHeader}>
            <button
              className={styles.backLink}
              onClick={() => router.push("/dashboard")}
            >
              ← Dashboard
            </button>

            <div className={styles.titleRow}>
              <h1 className={styles.pageTitle}>🎯 Skill Gap Analysis</h1>
              {refreshing && <span className={styles.refreshing}>Refreshing…</span>}
            </div>

            <p className={styles.pageSub}>
              Track your strengths and areas for improvement across all interviews
            </p>
          </div>

          {/* ══ SUMMARY CARDS ════════════════════════════════════ */}
          <div className={styles.summaryGrid}>

            <div className={styles.summaryCard}>
              <span className={styles.summaryVal}>{data.total_gaps}</span>
              <span className={styles.summaryLabel}>Total Skills</span>
            </div>

            <div className={`${styles.summaryCard} ${styles.weakCard}`}>
              <span
                className={styles.summaryVal}
                style={{ color: "#ef4444" }}
              >
                {data.weak_count}
              </span>
              <span className={styles.summaryLabel}>⚠️ Weak</span>
            </div>

            <div className={`${styles.summaryCard} ${styles.modCard}`}>
              <span
                className={styles.summaryVal}
                style={{ color: "#eab308" }}
              >
                {data.moderate_count}
              </span>
              <span className={styles.summaryLabel}>📈 Moderate</span>
            </div>

            <div className={`${styles.summaryCard} ${styles.strongCard}`}>
              <span
                className={styles.summaryVal}
                style={{ color: "#22c55e" }}
              >
                {data.strong_count}
              </span>
              <span className={styles.summaryLabel}>💪 Strong</span>
            </div>

          </div>

          {/* ══ VISUAL OVERVIEW BAR ══════════════════════════════ */}
          <div className={styles.overviewCard}>
            <h2 className={styles.sectionTitle}>📊 Skills Overview</h2>

            {/* Stacked Bar */}
            <div className={styles.stackedBar}>
              {data.weak_count > 0 && (
                <div
                  className={styles.stackSegment}
                  style={{
                    width     : `${(data.weak_count / data.total_gaps) * 100}%`,
                    background: "#ef4444",
                  }}
                  title={`Weak: ${data.weak_count}`}
                />
              )}
              {data.moderate_count > 0 && (
                <div
                  className={styles.stackSegment}
                  style={{
                    width     : `${(data.moderate_count / data.total_gaps) * 100}%`,
                    background: "#eab308",
                  }}
                  title={`Moderate: ${data.moderate_count}`}
                />
              )}
              {data.strong_count > 0 && (
                <div
                  className={styles.stackSegment}
                  style={{
                    width     : `${(data.strong_count / data.total_gaps) * 100}%`,
                    background: "#22c55e",
                  }}
                  title={`Strong: ${data.strong_count}`}
                />
              )}
            </div>

            {/* Legend */}
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: "#ef4444" }} />
                Weak ({data.weak_count})
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: "#eab308" }} />
                Moderate ({data.moderate_count})
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: "#22c55e" }} />
                Strong ({data.strong_count})
              </span>
            </div>

            {/* All Skills Mini Bars */}
            <div className={styles.miniGrid}>
              {data.skill_gaps.map(gap => (
                <div key={gap.id} className={styles.miniBar}>
                  <div className={styles.miniLabel}>{gap.skill_name}</div>
                  <div className={styles.miniBg}>
                    <div
                      className={styles.miniFill}
                      style={{
                        width     : `${gap.gap_score}%`,
                        background: getLevelColor(gap.proficiency_level),
                      }}
                    />
                  </div>
                  <span
                    className={styles.miniScore}
                    style={{ color: getLevelColor(gap.proficiency_level) }}
                  >
                    {gap.gap_score.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ══ FILTER TABS ══════════════════════════════════════ */}
          <div className={styles.filterRow}>
            {(["all", "weak", "moderate", "strong"] as const).map(f => (
              <button
                key       = {f}
                onClick   = {() => setFilter(f)}
                className = {`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
                style={filter === f && f !== "all" ? {
                  color      : getLevelColor(f),
                  borderColor: getLevelColor(f),
                  background : getLevelBg(f),
                } : {}}
              >
                {f === "all"      ? `All (${data.total_gaps})`             : ""}
                {f === "weak"     ? `⚠️ Weak (${data.weak_count})`         : ""}
                {f === "moderate" ? `📈 Moderate (${data.moderate_count})` : ""}
                {f === "strong"   ? `💪 Strong (${data.strong_count})`     : ""}
              </button>
            ))}
          </div>

          {/* ══ SKILL CARDS ══════════════════════════════════════ */}
          <div className={styles.skillsList}>
            {filtered.length === 0 ? (
              <div className={styles.noResults}>
                No {filter} skills found
              </div>
            ) : (
              filtered.map(gap => (
                <SkillBar key={gap.id} gap={gap} />
              ))
            )}
          </div>

          {/* ══ ACTIONS ══════════════════════════════════════════ */}
          <div className={styles.actions}>
            <button
              className={styles.newInterviewBtn}
              onClick={() => router.push("/interview/setup")}
            >
              🚀 Practice Weak Skills
            </button>
            <button
              className={styles.dashBtn}
              onClick={() => router.push("/dashboard")}
            >
              ← Back to Dashboard
            </button>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}