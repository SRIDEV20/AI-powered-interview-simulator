"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  getInterviewDetail,
  submitAnswer,
  completeInterview,
  InterviewDetail,
  InterviewQuestion,
  EvaluationResult,
} from "@/lib/api";
import styles from "./page.module.css";

// ── Helpers ────────────────────────────────────────────────────────
function getScoreColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#6ea8fe";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────────────────────
export default function InterviewSessionPage() {
  const { token }   = useAuth();
  const params      = useParams();
  const router      = useRouter();
  const interviewId = params.id as string;

  // ── State ─────────────────────────────────────────────────────
  const [interview,  setInterview]  = useState<InterviewDetail | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer,     setAnswer]     = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [allEvals,   setAllEvals]   = useState<EvaluationResult[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [phase, setPhase] = useState<"answering" | "feedback" | "finished">("answering");

  // ── Timer ─────────────────────────────────────────────────────
  const [elapsed,    setElapsed]   = useState(0);
  const timerRef                   = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef               = useRef<number>(Date.now());

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── Load interview ─────────────────────────────────────────────
  useEffect(() => {
    if (!token || !interviewId) return;
    const load = async () => {
      try {
        const data = await getInterviewDetail(token, interviewId);
        // Sort questions by order_number
        data.questions.sort((a, b) => a.order_number - b.order_number);
        setInterview(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load interview");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, interviewId]);

  // ── Start timer when answering phase begins ────────────────────
  useEffect(() => {
    if (!loading && phase === "answering") {
      startTimer();
    }
    return () => stopTimer();
  }, [currentIdx, loading, phase, startTimer, stopTimer]);

  // ── Current question ───────────────────────────────────────────
  const questions = interview?.questions ?? [];
  const currentQ  = questions[currentIdx] as InterviewQuestion | undefined;
  const totalQ    = questions.length;
  const isLastQ   = currentIdx === totalQ - 1;
  const progress  = totalQ > 0 ? (currentIdx / totalQ) * 100 : 0;

  // ── Submit Answer ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!answer.trim() || !token || !currentQ) return;

    stopTimer();
    setSubmitting(true);
    setError(null);

    try {
      const result = await submitAnswer(token, interviewId, currentQ.id, {
        user_answer        : answer.trim(),
        time_taken_seconds : elapsed,
      });

      setEvaluation(result);
      setAllEvals(prev => [...prev, result]);
      setPhase("feedback");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
      startTimer(); // restart timer on error
    } finally {
      setSubmitting(false);
    }
  };

  // ── Next Question ─────────��────────────────────────────────────
  const handleNext = async () => {
    if (isLastQ) {
      setCompleting(true);
      try {
        await completeInterview(token!, interviewId);
        setPhase("finished");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to complete interview");
      } finally {
        setCompleting(false);
      }
    } else {
      setCurrentIdx(prev => prev + 1);
      setAnswer("");
      setEvaluation(null);
      setPhase("answering");
    }
  };

  // ── View Results ───────────────────────────────────────────────
  const handleViewResults = () => {
    router.push(`/results/${interviewId}`);
  };

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <ProtectedRoute>
        <div className={styles.centerPage}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading interview...</p>
        </div>
      </ProtectedRoute>
    );
  }

  // ── Error ──────────────────────────────────────────────────────
  if (error && !interview) {
    return (
      <ProtectedRoute>
        <div className={styles.centerPage}>
          <div className={styles.errorBox}>⚠️ {error}</div>
          <button
            className = {styles.backBtn}
            onClick   = {() => router.push("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  // ── Finished Screen ────────────────────────────────────────────
  if (phase === "finished") {
    const avgScore = allEvals.length > 0
      ? allEvals.reduce((sum, e) => sum + e.score, 0) / allEvals.length
      : 0;

    return (
      <ProtectedRoute>
        <div className={styles.centerPage}>
          <div className={styles.finishedCard}>
            <div className={styles.finishedIcon}>🏁</div>
            <h1 className={styles.finishedTitle}>Interview Complete!</h1>
            <p className={styles.finishedSub}>
              You answered all {totalQ} questions for{" "}
              <strong>{interview?.job_role}</strong>
            </p>

            <div
              className={styles.finishedScore}
              style={{ color: getScoreColor(avgScore) }}
            >
              {avgScore.toFixed(1)}%
            </div>
            <p className={styles.finishedScoreLabel}>Session Average</p>

            <div className={styles.finishedStats}>
              <div className={styles.finishedStat}>
                <span className={styles.finishedStatVal}>{totalQ}</span>
                <span className={styles.finishedStatLabel}>Questions</span>
              </div>
              <div className={styles.finishedStat}>
                <span
                  className={styles.finishedStatVal}
                  style={{ color: getScoreColor(Math.max(...allEvals.map(e => e.score))) }}
                >
                  {Math.max(...allEvals.map(e => e.score)).toFixed(1)}%
                </span>
                <span className={styles.finishedStatLabel}>Best Answer</span>
              </div>
              <div className={styles.finishedStat}>
                <span className={styles.finishedStatVal}>
                  {allEvals.filter(e => e.score >= 70).length}/{totalQ}
                </span>
                <span className={styles.finishedStatLabel}>Good Answers</span>
              </div>
            </div>

            <button
              onClick   = {handleViewResults}
              className = {styles.resultsBtn}
            >
              📊 View Detailed Results →
            </button>
            <button
              onClick   = {() => router.push("/dashboard")}
              className = {styles.dashBtn}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <div className={styles.page}>
        <div className={styles.container}>

          {/* ── Top Bar ── */}
          <div className={styles.topBar}>
            <div className={styles.topLeft}>
              <span className={styles.roleBadge}>🎤 {interview?.job_role}</span>
              <span className={styles.diffBadge}>{interview?.difficulty}</span>
            </div>
            <div className={styles.topRight}>
              <span className={styles.questionCounter}>
                Question {currentIdx + 1} of {totalQ}
              </span>
              <span className={`${styles.timer} ${elapsed > 120 ? styles.timerWarn : ""}`}>
                ⏱ {formatTime(elapsed)}
              </span>
            </div>
          </div>

          {/* ── Progress Bar ── */}
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* ── Error ── */}
          {error && (
            <div className={styles.alertError}>⚠️ {error}</div>
          )}

          {/* ══ ANSWERING PHASE ══════════════════════════════════ */}
          {phase === "answering" && currentQ && (
            <div className={styles.sessionCard}>

              {/* Question */}
              <div className={styles.questionSection}>
                <div className={styles.questionMeta}>
                  {/* ✅ Fixed: type not question_type */}
                  <span className={styles.qTypeBadge}>{currentQ.type}</span>
                  {/* ✅ Fixed: difficulty not skill_category */}
                  <span className={styles.qCatBadge}>{currentQ.difficulty}</span>
                </div>
                {/* ✅ Fixed: question not question_text */}
                <h2 className={styles.questionText}>{currentQ.question}</h2>
              </div>

              {/* Answer Area */}
              <div className={styles.answerSection}>
                <label className={styles.answerLabel}>Your Answer</label>
                <textarea
                  value       = {answer}
                  onChange    = {e => setAnswer(e.target.value)}
                  placeholder = "Type your answer here... Be specific and use examples where possible."
                  className   = {styles.answerBox}
                  disabled    = {submitting}
                  rows        = {8}
                />
                <div className={styles.answerFooter}>
                  <span className={styles.charCount}>
                    {answer.length} characters
                    {answer.length < 50 && answer.length > 0 && (
                      <span className={styles.charHint}> (aim for 100+ chars)</span>
                    )}
                  </span>
                  <button
                    onClick   = {handleSubmit}
                    disabled  = {submitting || answer.trim().length < 10}
                    className = {`${styles.submitBtn} ${submitting ? styles.submitBtnLoading : ""}`}
                  >
                    {submitting ? (
                      <span className={styles.loadingRow}>
                        <span className={styles.btnSpinner} />
                        Evaluating...
                      </span>
                    ) : "Submit Answer →"}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ══ FEEDBACK PHASE ════════════════════════════════════ */}
          {phase === "feedback" && evaluation && currentQ && (
            <div className={styles.sessionCard}>

              {/* Question recap */}
              <div className={styles.questionRecap}>
                <span className={styles.recapLabel}>Q{currentIdx + 1}:</span>
                {/* ✅ Fixed: question not question_text */}
                <span className={styles.recapText}>{currentQ.question}</span>
              </div>

              {/* Score */}
              <div className={styles.scoreRow}>
                <div
                  className={styles.scoreBig}
                  style={{ color: getScoreColor(evaluation.score) }}
                >
                  {evaluation.score.toFixed(1)}%
                </div>
                <div className={styles.scoreLabel}>AI Score</div>
              </div>

              {/* Feedback */}
              <div className={styles.feedbackBox}>
                <h3 className={styles.feedbackTitle}>💬 Feedback</h3>
                <p className={styles.feedbackText}>{evaluation.feedback}</p>
              </div>

              {/* Strengths + Improvements */}
              <div className={styles.siGrid}>

                <div className={styles.siCard}>
                  <h4 className={styles.siTitle} style={{ color: "#22c55e" }}>
                    ✅ Strengths
                  </h4>
                  {evaluation.strengths.length > 0 ? (
                    <ul className={styles.siList}>
                      {evaluation.strengths.map((s, i) => (
                        <li key={i} className={styles.siItem}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.siEmpty}>Keep practicing!</p>
                  )}
                </div>

                <div className={styles.siCard}>
                  <h4 className={styles.siTitle} style={{ color: "#f97316" }}>
                    📈 Improvements
                  </h4>
                  {evaluation.improvements.length > 0 ? (
                    <ul className={styles.siList}>
                      {evaluation.improvements.map((s, i) => (
                        <li key={i} className={styles.siItem}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.siEmpty}>Great answer!</p>
                  )}
                </div>

              </div>

              {/* Sample Answer */}
              {evaluation.sample_answer && (
                <details className={styles.sampleDetails}>
                  <summary className={styles.sampleSummary}>
                    💡 View Sample Answer
                  </summary>
                  <p className={styles.sampleText}>{evaluation.sample_answer}</p>
                </details>
              )}

              {/* Next / Finish */}
              <div className={styles.nextRow}>
                <span className={styles.nextHint}>
                  {isLastQ
                    ? "🏁 This was the last question!"
                    : `Next: Question ${currentIdx + 2} of ${totalQ}`}
                </span>
                <button
                  onClick   = {handleNext}
                  disabled  = {completing}
                  className = {styles.nextBtn}
                >
                  {completing ? (
                    <span className={styles.loadingRow}>
                      <span className={styles.btnSpinner} />
                      Finishing...
                    </span>
                  ) : isLastQ ? "Finish Interview 🏁" : "Next Question →"}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}