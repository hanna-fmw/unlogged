import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { listen } from "@tauri-apps/api/event";
import { getActiveAnimation } from "./animations";
import { AudioController } from "./audio/AudioController";
import { hideOverlay } from "./lib/tauri";
import ReportButton from "./overlay/ReportButton";
import MissingCounter from "./overlay/MissingCounter";
import SnoozeButton from "./overlay/SnoozeButton";

const mod = getActiveAnimation();

export default function App() {
  const [runId, setRunId] = useState(0);
  // Start hidden — Rust emits `overlay:will-show` BEFORE `win.show()`, so
  // the first reveal flips this to true (and bumps runId) while the window
  // is still off-screen, giving React a paint at the fresh initial state.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const audio = new AudioController(mod.audio);

    const unlistenShow = listen("overlay:will-show", () => {
      // flushSync forces the remount to commit before Rust's `win.show()`
      // returns, so the OS paints the initial DOM, never a stale frame.
      flushSync(() => {
        setRunId((n) => n + 1);
        setVisible(true);
      });
      audio.start();
    });
    const unlistenHide = listen("overlay:did-hide", () => {
      audio.stop();
      // Unmount kills child setTimeout chains so they can't keep ticking
      // while the window is hidden.
      setVisible(false);
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        audio.stop();
        void hideOverlay().catch(console.error);
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      void unlistenShow.then((fn) => fn());
      void unlistenHide.then((fn) => fn());
      window.removeEventListener("keydown", onKey);
      audio.stop();
    };
  }, []);

  const backdropStyles =
    mod.backdrop === "black"
      ? { background: "#000" }
      : {
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          background: "rgba(255,255,255,0.18)",
        };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        ...backdropStyles,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        placeItems: "center",
        padding: 48,
        gap: 24,
        fontFamily: "system-ui",
      }}
    >
      {visible && !mod.ownsChrome && <MissingCounter key={`counter-${runId}`} />}
      {visible && <mod.Component key={`anim-${runId}`} />}
      {visible && !mod.ownsChrome && (
        <div style={{ display: "grid", placeItems: "center", gap: 12 }}>
          <ReportButton />
          <SnoozeButton />
        </div>
      )}
    </div>
  );
}
