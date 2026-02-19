import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackendStatus from "@/components/BackendStatus";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className="container">

          {/* Hero */}
          <section className={styles.hero}>
            <div className={styles.badge}>🚀 AI Powered</div>
            <h1 className={styles.title}>
              Practice Interviews with
              <span className={styles.highlight}> Instant AI Feedback</span>
            </h1>
            <p className={styles.subtitle}>
              Simulate real interview rounds, get actionable feedback,
              and track your skill gaps over time.
            </p>
            <div className={styles.ctaRow}>
              <a className={styles.primaryBtn} href="/register">
                Get Started Free
              </a>
              <a
                className={styles.secondaryBtn}
                href="http://localhost:8000/api/docs"
                target="_blank"
                rel="noreferrer"
              >
                API Docs →
              </a>
            </div>
          </section>

          {/* Backend Status */}
          <section id="status" className={styles.section}>
            <BackendStatus />
          </section>

          <hr />

          {/* Features */}
          <section id="features" className={styles.section}>
            <h2 className={styles.sectionTitle}>Features</h2>
            <div className={styles.grid}>
              <div className={styles.card}>
                <div className={styles.cardIcon}>🎯</div>
                <h3>Role-based Interviews</h3>
                <p>Choose job role and difficulty to generate focused questions.</p>
              </div>
              <div className={styles.card}>
                <div className={styles.cardIcon}>🤖</div>
                <h3>AI Feedback</h3>
                <p>Scoring, strengths, weaknesses, and improvement tips.</p>
              </div>
              <div className={styles.card}>
                <div className={styles.cardIcon}>📊</div>
                <h3>Skill Gap Tracking</h3>
                <p>See where you are weak and what to practice next.</p>
              </div>
            </div>
          </section>

          <hr />

          {/* How it works */}
          <section id="how" className={styles.section}>
            <h2 className={styles.sectionTitle}>How it works</h2>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNum}>1</div>
                <div>
                  <h3>Create Account</h3>
                  <p>Sign up and set your target job role</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>2</div>
                <div>
                  <h3>Start Interview</h3>
                  <p>Choose difficulty and begin your session</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>3</div>
                <div>
                  <h3>Answer Questions</h3>
                  <p>Respond to AI-generated interview questions</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>4</div>
                <div>
                  <h3>Get Feedback</h3>
                  <p>Review detailed AI feedback and skill gaps</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}