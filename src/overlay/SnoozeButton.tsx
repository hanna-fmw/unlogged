import { snooze } from "../lib/tauri";

export default function SnoozeButton() {
  return (
    <button
      onClick={() => void snooze().catch(console.error)}
      style={{
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.4)",
        color: "rgba(255,255,255,0.85)",
        padding: "8px 16px",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      Snooze 15 min
    </button>
  );
}
