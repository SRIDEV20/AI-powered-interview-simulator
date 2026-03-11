"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  getInterviewScore,
  InterviewScoreResponse,
  QuestionScore,
} from "@/lib/api";
import styles from "./page.module.css";

// ── Helpers ────────────────────────────────────────────────────────
function getScoreColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#6ea8fe";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Average";
  return "Needs Work";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month : "short",
    day   : "numeric",
    year  : "numeric",
    hour  : "2-digit",
    minute: "2-digit",
  });
}

function getDuration(start: string, end: string): string {
  const diff = Math.floor(
    (new Date(end).getTime() - new Date(start).getTime()) / 1000
  );
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}m ${s}s`;
}

// ── Score Ring ─────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const radius      = 54;
  const circumference = 2 * Math.PI * radius;
  const offset      = circumference - (score / 100) * circumference;
  const color       = getScoreColor(score);

  return (
    <div className={styles.ringWrapper}>
      <svg width="130" height="130" className={styles.ringSvg}>
        {/* Background circle */}
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />
        {/* Score arc */}
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className={styles.ringInner}>
        <span className={styles.ringScore} style={{ color }}>
          {score.toFixed(1)}%
        </span>
        <span className={styles.ringLabel}>Overall</span>
      </div>
    </div>
  );
}

// ── Question Card ──────────────────────────────────────────────────
function QuestionCard({ q, idx }: { q: QuestionScore; idx: number }) {
  const [open, setOpen] = useState(false);
  const color           = getScoreColor(q.score);

  return (
    <div className={styles.qCard}>
      {/* Header */}
      <button
        className={styles.qCardHeader}
        onClick={() => setOpen(o => !o)}
      >
        <div className={styles.qCardLeft}>
          <span className={styles.qNum}>Q{idx + 1}</span>
          <span className={styles.qText}>{q.question_text}</span>
        </div>
        <div className={styles.qCardRight}>
          <span
            className={styles.qScore}
            style={{ color }}
          >
            {q.score.toFixed(1)}%
          </span>
          <span className={styles.qScoreLabel} style={{ color }}>
            {getScoreLabel(q.score)}
          </span>
          <span className={styles.qChevron}>
            {open ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {/* Score Bar */}
      <div className={styles.qBarBg}>
        <div
          className={styles.qBarFill}
          style={{ width: `${q.score}%`, background: color }}
        />
      </div>

      {/* Expanded Details */}
      {open && (
        <div className={styles.qDetails}>

          {/* Feedback */}
          <div className={styles.qFeedback}>
            <span className={styles.qFeedbackIcon}>💬</span>
            <p className={styles.qFeedbackText}>{q.feedback}</p>
          </div>

          {/* Strengths + Improvements */}
          <div className={styles.qSiGrid}>
            <div className={styles.qSiCard}>
              <h5 className={styles.qSiTitle} style={{ color: "#22c55e" }}>
                ✅ Strengths
              </h5>
              {q.strengths.length > 0 ? (
                <ul className={styles.qSiList}>
                  {q.strengths.map((s, i) => (
                    <li key={i} className={styles.qSiItem}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.qSiEmpty}>Keep practicing!</p>
              )}
            </div>
            <div className={styles.qSiCard}>
              <h5 className={styles.qSiTitle} style={{ color: "#f97316" }}>
                📈 Improvements
              </h5>
              {q.improvements.length > 0 ? (
                <ul className={styles.qSiList}>
                  {q.improvements.map((s, i) => (
                    <li key={i} className={styles.qSiItem}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.qSiEmpty}>Great answer!</p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const { token }   = useAuth();
  const params      = useParams();
  const router      = useRouter();
  const interviewId = params.id as string;

  const [data,    setData]    = useState<InterviewScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!token || !interviewId) return;
    const load = async () => {
      try {
        const result = await getInterviewScore(token, interviewId);
        setData(result);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, interviewId]);

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <ProtectedRoute>
        <div className={styles.centerPage}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading your results...</p>
        </div>
      </ProtectedRoute>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <ProtectedRoute>
        <div className={styles.centerPage}>
          <div className={styles.errorBox}>⚠️ {error ?? "Results not found"}</div>
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

  const scoreColor = getScoreColor(data.overall_score);

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
            <h1 className={styles.pageTitle}>📊 Interview Results</h1>
            <p className={styles.pageSub}>
              {data.job_role} · {data.difficulty} · {formatDate(data.completed_at)}
            </p>
          </div>

          {/* ══ TOP SECTION - Score + Stats ══════════════════════ */}
          <div className={styles.topSection}>

            {/* Score Ring */}
            <div className={styles.scoreCard}>
              <ScoreRing score={data.overall_score} />
              <div className={styles.perfBadge} style={{ color: scoreColor }}>
                {data.performance.label}
              </div>
              <p className={styles.perfMessage}>{data.performance.message}</p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statVal}>{data.answered}/{data.total_questions}</span>
                <span className={styles.statLabel}>Answered</span>
              </div>
              <div className={styles.statBox}>
                <span
                  className={styles.statVal}
                  style={{ color: scoreColor }}
                >
                  {data.overall_score.toFixed(1)}%
                </span>
                <span className={styles.statLabel}>Overall Score</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statVal}>{data.completion_rate.toFixed(0)}%</span>
                <span className={styles.statLabel}>Completion</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statVal}>
                  {getDuration(data.started_at, data.completed_at)}
                </span>
                <span className={styles.statLabel}>Duration</span>
              </div>

              {/* Category Scores */}
              {data.category_scores.map(c => (
                <div key={c.category} className={styles.statBox}>
                  <span
                    className={styles.statVal}
                    style={{ color: getScoreColor(c.average_score) }}
                  >
                    {c.average_score.toFixed(1)}%
                  </span>
                  <span className={styles.statLabel} style={{ textTransform: "capitalize" }}>
                    {c.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ══ OVERALL SUMMARY ══════════════════════════════════ */}
          {data.overall_summary && (
            <div className={styles.summaryCard}>
              <h2 className={styles.sectionTitle}>🤖 AI Summary</h2>
              <p className={styles.summaryText}>{data.overall_summary}</p>
            </div>
          )}

          {/* ══ TOP STRENGTHS + IMPROVEMENTS ═════════════════════ */}
          <div className={styles.siSection}>

            <div className={styles.siCard}>
              <h2 className={styles.siTitle} style={{ color: "#22c55e" }}>
                ✅ Top Strengths
              </h2>
              <ul className={styles.siList}>
                {data.top_strengths.map((s, i) => (
                  <li key={i} className={styles.siItem}>
                    <span className={styles.siDot} style={{ background: "#22c55e" }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.siCard}>
              <h2 className={styles.siTitle} style={{ color: "#f97316" }}>
                📈 Top Improvements
              </h2>
              <ul className={styles.siList}>
                {data.top_improvements.map((s, i) => (
                  <li key={i} className={styles.siItem}>
                    <span className={styles.siDot} style={{ background: "#f97316" }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* ══ QUESTION BREAKDOWN ═══════════════════════════════ */}
          <div className={styles.questionsSection}>
            <h2 className={styles.sectionTitle}>
              📝 Question Breakdown
              <span className={styles.sectionCount}>
                {data.question_scores.length} questions
              </span>
            </h2>
            <div className={styles.questionsList}>
              {data.question_scores
                .sort((a, b) => a.order_number - b.order_number)
                .map((q, i) => (
                  <QuestionCard key={q.question_id} q={q} idx={i} />
                ))}
            </div>
          </div>

          {/* ══ ACTIONS ══════════════════════════════════════════ */}
          <div className={styles.actions}>
            <button
              className={styles.newInterviewBtn}
              onClick={() => router.push("/interview/setup")}
            >
              🚀 Start New Interview
            </button>
            <button
              className={styles.dashboardBtn}
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