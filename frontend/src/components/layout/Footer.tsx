import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.inner}>
          <span>© {new Date().getFullYear()} AI Interview Simulator</span>
          <span className={styles.muted}>Built by SRIDEV20</span>
        </div>
      </div>
    </footer>
  );
}