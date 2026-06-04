import { useEffect } from "react";
import type { AnimationModule } from "../types";
import sirenUrl from "../../audio/siren.mp3?url";
import "./styles.css";

function SirenAnimation({ onSequenceComplete }: { onSequenceComplete?: () => void }) {
  useEffect(() => {
    onSequenceComplete?.();
  }, [onSequenceComplete]);

  return (
    <div className="siren-stage">
      <div className="siren-strobe" />
      <div className="siren-beam beam-a" />
      <div className="siren-beam beam-b" />
      <div className="siren-body">
        <div className="siren-dome">
          <div className="siren-dome-shine" />
        </div>
        <div className="siren-base" />
      </div>
    </div>
  );
}

const siren: AnimationModule = {
  name: "siren",
  Component: SirenAnimation,
  audio: {
    calm: sirenUrl,
    annoying: sirenUrl,
    switchAtMs: 0,
  },
};

export default siren;
