import { useEffect, useState } from "react";
import type { AnimationModule } from "../types";
import sirenUrl from "../../audio/siren.mp3?url";
import { missingDays, reportTime, snooze } from "../../lib/tauri";
import config from "../../../assets-config.json";
import Typewriter from "./Typewriter";
import SkullReveal from "./SkullReveal";
import "./styles.css";

type Phase = "header" | "skull" | "footer" | "button" | "done";

function TerminalSkullAnimation({ onSequenceComplete }: { onSequenceComplete?: () => void }) {
  const [phase, setPhase] = useState<Phase>("header");
  const [days, setDays] = useState<number | null>(null);
  const [daysErr, setDaysErr] = useState<string | null>(null);

  useEffect(() => {
    missingDays()
      .then(setDays)
      .catch((e) => setDaysErr(String(e)));
  }, []);

  useEffect(() => {
    if (phase === "done") onSequenceComplete?.();
  }, [phase, onSequenceComplete]);

  const daysLabel =
    daysErr !== null
      ? "??"
      : days === null
        ? "..."
        : days === 0
          ? "0"
          : String(days);
  const headerText = `> INTRUSION DETECTED - UNLOGGED DAYS: ${daysLabel}`;
  const footerText = "> ACTION REQUIRED: REPORT IMMEDIATELY";

  const onReport = () =>
    void reportTime(config.harvestUrl, config.chromeProfile).catch(console.error);

  return (
    <div className="terminal-stage">
      <div className="terminal-line terminal-line-header">
        {phase === "header" ? (
          <Typewriter text={headerText} charDelayMs={35} onDone={() => setPhase("skull")} />
        ) : (
          <span>{headerText}</span>
        )}
      </div>

      {phase !== "header" && (
        <SkullReveal charDelayMs={2} onDone={() => phase === "skull" && setPhase("footer")} />
      )}

      <div className="terminal-line terminal-line-footer">
        {phase === "footer" ? (
          <Typewriter
            text={footerText}
            charDelayMs={35}
            onDone={() => setPhase("button")}
          />
        ) : phase === "button" || phase === "done" ? (
          <span>{footerText}</span>
        ) : (
          " "
        )}
      </div>

      <button
        type="button"
        className="terminal-report-btn"
        onClick={onReport}
        disabled={phase !== "button" && phase !== "done"}
        style={{ visibility: phase === "button" || phase === "done" ? "visible" : "hidden" }}
      >
        {phase === "button" ? (
          <Typewriter
            text="[ REPORT TIME → ]"
            charDelayMs={45}
            cursor
            onDone={() => setPhase("done")}
          />
        ) : phase === "done" ? (
          <span>[ REPORT TIME → ]</span>
        ) : (
          <span>[ REPORT TIME → ]</span>
        )}
      </button>

      <button
        type="button"
        className="terminal-snooze-btn"
        onClick={() => void snooze().catch(console.error)}
        style={{ visibility: phase === "done" ? "visible" : "hidden" }}
      >
        [ snooze 15m ]
      </button>

      <div className="terminal-scanlines" />
    </div>
  );
}

const terminalSkull: AnimationModule = {
  name: "terminal-skull",
  Component: TerminalSkullAnimation,
  audio: {
    calm: sirenUrl,
    annoying: sirenUrl,
    switchAtMs: 0,
  },
  backdrop: "black",
  ownsChrome: true,
};

export default terminalSkull;
