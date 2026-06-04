import type { FC } from "react";

export type Backdrop = "frosted" | "black";

export interface AnimationModule {
  name: string;
  Component: FC<{ onSequenceComplete?: () => void }>;
  audio: { calm: string; annoying: string; switchAtMs: number };
  backdrop?: Backdrop;
  /** When true, the animation owns the counter/report/snooze chrome and App.tsx hides its own. */
  ownsChrome?: boolean;
}
