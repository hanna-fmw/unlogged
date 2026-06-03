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
      <CalmBird delayMs={0} />
      <CalmBird delayMs={600} />
      <CalmBird delayMs={1200} />
      <Intruder />
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
