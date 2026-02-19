"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";
import styles from "./BackendStatus.module.css";

type Health = { status: string; timestamp: string };

export default function BackendStatus() {
  const [data, setData] = useState<Health | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHealth()
      .then(setData)
      .catch((e) => setError(e?.message ?? "Unknown error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className={styles.statusBox}>
      <span className={styles.dot} style={{ background: "#aab3d6" }} />
      Checking backend...
    </div>
  );

  if (error) return (
    <div className={styles.statusBox}>
      <span className={styles.dot} style={{ background: "#ff6b6b" }} />
      Backend offline — start with <code>python main.py</code>
    </div>
  );

  return (
    <div className={styles.statusBox}>
      <span className={styles.dot} style={{ background: "#51cf66" }} />
      Backend <b>{data?.status}</b> • {data?.timestamp}
    </div>
  );
}