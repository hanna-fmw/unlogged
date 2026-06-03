import type { FC } from "react";

export interface AnimationModule {
  name: string;
  Component: FC<{ onSequenceComplete?: () => void }>;
  audio: { calm: string; annoying: string; switchAtMs: number };
}
