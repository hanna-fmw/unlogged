import { useEffect, useState } from "react";
import { missingDays } from "../lib/tauri";

export default function MissingCounter() {
  const [n, setN] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    missingDays()
      .then(setN)
      .catch((e) => setErr(String(e)));
  }, []);

  if (err) return <div style={{ color: "#b91c1c" }}>Harvest unavailable ({err})</div>;
  if (n === null) return null;
  if (n === 0) {
    return <div style={{ color: "#16a34a", fontSize: 32, fontWeight: 800 }}>ALL CAUGHT UP</div>;
  }
  return (
    <div
      style={{
        color: "white",
        background: "#dc2626",
        padding: "12px 24px",
        borderRadius: 12,
        fontSize: 40,
        fontWeight: 900,
        animation: "blink 0.7s steps(2, end) infinite",
      }}
    >
      {n} {n === 1 ? "DAY" : "DAYS"} MISSING
      <style>{`@keyframes blink { 50% { opacity: 0.35; } }`}</style>
    </div>
  );
}
