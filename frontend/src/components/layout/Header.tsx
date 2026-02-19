import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.brand}>
            🤖 AI Interview Simulator
          </div>
          <nav className={styles.nav}>
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#status">Status</a>
          </nav>
        </div>
      </div>
    </header>
  );
}