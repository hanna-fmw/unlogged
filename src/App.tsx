import { useEffect, useState } from "react";
import { getActiveAnimation } from "./animations";
import { AudioController } from "./audio/AudioController";
import { hideOverlay } from "./lib/tauri";
import ReportButton from "./overlay/ReportButton";
import MissingCounter from "./overlay/MissingCounter";
import SnoozeButton from "./overlay/SnoozeButton";

const mod = getActiveAnimation();

export default function App() {
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const audio = new AudioController(mod.audio);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        setRunId((n) => n + 1);
        audio.start();
      } else {
        audio.stop();
      }
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        audio.stop();
        void hideOverlay().catch(console.error);
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keydown", onKey);
      audio.stop();
    };
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
        gridTemplateRows: "auto 1fr auto",
        placeItems: "center",
        padding: 48,
        gap: 24,
        fontFamily: "system-ui",
      }}
    >
      <MissingCounter key={`counter-${runId}`} />
      <mod.Component key={`anim-${runId}`} />
      <div style={{ display: "grid", placeItems: "center", gap: 12 }}>
        <ReportButton />
        <SnoozeButton />
      </div>
    </div>
  );
}
