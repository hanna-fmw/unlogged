import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function App() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") void invoke("hide_overlay").catch(console.error);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        background: "rgba(255,255,255,0.18)",
        display: "grid",
        placeItems: "center",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ fontSize: 64 }}>Time Report Reminder (press Esc)</h1>
    </div>
  );
}
