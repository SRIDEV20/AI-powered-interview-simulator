"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  createInterview,
  Difficulty,
  QuestionType,
} from "@/lib/api";
import styles from "./page.module.css";

// ── Option Data ────────────────────────────────────────────────────
const DIFFICULTIES: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: "beginner",     label: "Beginner",     desc: "Entry level concepts",     color: "#22c55e" },
  { value: "intermediate", label: "Intermediate", desc: "Mid-level experience",      color: "#eab308" },
  { value: "advanced",     label: "Advanced",     desc: "Senior level depth",        color: "#ef4444" },
];

const QUESTION_COUNTS = [3, 5, 7, 10];

const QUESTION_TYPES: { value: QuestionType; label: string; desc: string; icon: string }[] = [
  { value: "technical",  label: "Technical",  desc: "Coding & system design",   icon: "💻" },
  { value: "behavioral", label: "Behavioral", desc: "Soft skills & scenarios",  icon: "🧠" },
  { value: "mixed",      label: "Mixed",      desc: "Both technical & behavioral", icon: "⚡" },
];

const POPULAR_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "React Developer",
  "Python Developer",
  "Java Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Mobile Developer",
];

// ─────────────────────────────────────────────────────────────────
export default function InterviewSetupPage() {
  const { token } = useAuth();
  const router    = useRouter();

  const [jobRole,       setJobRole]       = useState("");
  const [difficulty,    setDifficulty]    = useState<Difficulty>("intermediate");
  const [numQuestions,  setNumQuestions]  = useState(5);
  const [questionType,  setQuestionType]  = useState<QuestionType>("technical");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [jobRoleError,  setJobRoleError]  = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ── Filtered suggestions ──────────────────────────────────────
  const suggestions = POPULAR_ROLES.filter(r =>
    r.toLowerCase().includes(jobRole.toLowerCase()) && jobRole.length > 0
  );

  // ── Validate ──────────────────────────────────────────────────
  const validate = (): boolean => {
    if (!jobRole.trim()) {
      setJobRoleError("Job role is required");
      return false;
    }
    if (jobRole.trim().length < 3) {
      setJobRoleError("Job role must be at least 3 characters");
      return false;
    }
    setJobRoleError("");
    return true;
  };

  // ── Handle Submit ─────────────────────────────────────────────
  const handleStart = async () => {
    if (!validate() || !token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await createInterview(token, {
        job_role      : jobRole.trim(),
        difficulty,
        num_questions : numQuestions,
        question_type : questionType,
      });

      // Redirect to interview session
      router.push(`/interview/${res.interview_id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create interview");
      setLoading(false);
    }
  };

  // ── Estimated time ────────────────────────────────────────────
  const estimatedMins = numQuestions * 2;

  // ─────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <div className={styles.page}>
        <div className={styles.container}>

          {/* ── Header ── */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>🎤 Setup Interview</h1>
            <p className={styles.pageSub}>
              Configure your AI-powered mock interview
            </p>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className={styles.alertError}>⚠️ {error}</div>
          )}

          {/* ── Loading Screen ── */}
          {loading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingCard}>
                <div className={styles.loadingSpinner} />
                <h2 className={styles.loadingTitle}>Generating Your Interview</h2>
                <p className={styles.loadingMsg}>
                  GPT-4 is crafting {numQuestions} {difficulty}{" "}
                  {questionType} questions for <strong>{jobRole}</strong>...
                </p>
                <p className={styles.loadingHint}>This may take 10–20 seconds ☕</p>
              </div>
            </div>
          )}

          <div className={styles.card}>

            {/* ══ SECTION 1 - Job Role ════════════════════════════ */}
            <div className={styles.section}>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionNum}>1</span>
                <span>What role are you interviewing for?</span>
              </div>

              <div className={styles.jobRoleWrapper}>
                <input
                  type        = "text"
                  value       = {jobRole}
                  onChange    = {e => {
                    setJobRole(e.target.value);
                    setJobRoleError("");
                    setShowSuggestions(true);
                  }}
                  onBlur      = {() => setTimeout(() => setShowSuggestions(false), 150)}
                  onFocus     = {() => setShowSuggestions(true)}
                  placeholder = "e.g. React Developer, Java Engineer..."
                  className   = {`${styles.jobInput} ${jobRoleError ? styles.jobInputError : ""}`}
                  disabled    = {loading}
                />

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    {suggestions.map(s => (
                      <button
                        key     = {s}
                        type    = "button"
                        className = {styles.suggestionItem}
                        onMouseDown = {() => {
                          setJobRole(s);
                          setShowSuggestions(false);
                          setJobRoleError("");
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {jobRoleError && (
                <span className={styles.fieldError}>⚠ {jobRoleError}</span>
              )}

              {/* Popular roles pills */}
              <div className={styles.pillRow}>
                <span className={styles.pillLabel}>Popular:</span>
                {POPULAR_ROLES.slice(0, 5).map(r => (
                  <button
                    key       = {r}
                    type      = "button"
                    className = {`${styles.pill} ${jobRole === r ? styles.pillActive : ""}`}
                    onClick   = {() => { setJobRole(r); setJobRoleError(""); }}
                    disabled  = {loading}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.divider} />

            {/* ══ SECTION 2 - Difficulty ══════════════════════════ */}
            <div className={styles.section}>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionNum}>2</span>
                <span>Select difficulty level</span>
              </div>

              <div className={styles.optionGrid}>
                {DIFFICULTIES.map(d => (
                  <button
                    key       = {d.value}
                    type      = "button"
                    onClick   = {() => setDifficulty(d.value)}
                    disabled  = {loading}
                    className = {`${styles.optionCard} ${difficulty === d.value ? styles.optionCardActive : ""}`}
                    style     = {difficulty === d.value
                      ? { borderColor: d.color, boxShadow: `0 0 0 1px ${d.color}33` }
                      : {}}
                  >
                    <span
                      className = {styles.optionDot}
                      style     = {{ background: d.color }}
                    />
                    <span className={styles.optionLabel}>{d.label}</span>
                    <span className={styles.optionDesc}>{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.divider} />

            {/* ══ SECTION 3 - Num Questions ═══════════════════════ */}
            <div className={styles.section}>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionNum}>3</span>
                <span>How many questions?</span>
              </div>

              <div className={styles.countRow}>
                {QUESTION_COUNTS.map(n => (
                  <button
                    key       = {n}
                    type      = "button"
                    onClick   = {() => setNumQuestions(n)}
                    disabled  = {loading}
                    className = {`${styles.countBtn} ${numQuestions === n ? styles.countBtnActive : ""}`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <p className={styles.estimateText}>
                ⏱ Estimated time: <strong>{estimatedMins}–{estimatedMins + 5} minutes</strong>
              </p>
            </div>

            <div className={styles.divider} />

            {/* ══ SECTION 4 - Question Type ════════════════════════ */}
            <div className={styles.section}>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionNum}>4</span>
                <span>Question type</span>
              </div>

              <div className={styles.optionGrid}>
                {QUESTION_TYPES.map(t => (
                  <button
                    key       = {t.value}
                    type      = "button"
                    onClick   = {() => setQuestionType(t.value)}
                    disabled  = {loading}
                    className = {`${styles.optionCard} ${questionType === t.value ? styles.optionCardActive : ""}`}
                  >
                    <span className={styles.optionIcon}>{t.icon}</span>
                    <span className={styles.optionLabel}>{t.label}</span>
                    <span className={styles.optionDesc}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.divider} />

            {/* ══ SUMMARY + START ══════════════════════════════════ */}
            <div className={styles.footer}>

              {/* Summary */}
              <div className={styles.summary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Role</span>
                  <span className={styles.summaryValue}>
                    {jobRole.trim() || <span className={styles.summaryEmpty}>Not set</span>}
                  </span>
                </div>
                <div className={styles.summarySep}>·</div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Difficulty</span>
                  <span className={styles.summaryValue} style={{
                    color: DIFFICULTIES.find(d => d.value === difficulty)?.color
                  }}>
                    {difficulty}
                  </span>
                </div>
                <div className={styles.summarySep}>·</div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Questions</span>
                  <span className={styles.summaryValue}>{numQuestions}</span>
                </div>
                <div className={styles.summarySep}>·</div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Type</span>
                  <span className={styles.summaryValue}>{questionType}</span>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick   = {handleStart}
                disabled  = {loading}
                className = {`${styles.startBtn} ${loading ? styles.startBtnLoading : ""}`}
              >
                {loading ? "Generating..." : "🚀 Start Interview"}
              </button>

            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}