import { useEffect, useState } from "react";
import type { AnimationModule } from "../types";
import CalmBird from "./CalmBird";
import Intruder from "./Intruder";
import calmUrl from "../../audio/calm.mp3?url";
import annoyingUrl from "../../audio/annoying.mp3?url";
import "./styles.css";

const SWITCH_MS = 2500;

function CssSpritesAnimation({ onSequenceComplete }: { onSequenceComplete?: () => void }) {
  const [dance, setDance] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDance(true);
      onSequenceComplete?.();
    }, SWITCH_MS);
    return () => clearTimeout(t);
  }, [onSequenceComplete]);

  return (
    <div className={`stage ${dance ? "dance" : ""}`}>
      <div className="bird-pair">
        <CalmBird delayMs={0} />
        <CalmBird delayMs={600} />
      </div>
      <div className="intruder-slot">
        <Intruder />
      </div>
      <div className="bird-pair">
        <CalmBird delayMs={1200} />
        <CalmBird delayMs={1800} />
      </div>
    </div>
  );
}

const cssSprites: AnimationModule = {
  name: "css-sprites",
  Component: CssSpritesAnimation,
  audio: {
    calm: calmUrl,
    annoying: annoyingUrl,
    switchAtMs: SWITCH_MS,
  },
};

export default cssSprites;
