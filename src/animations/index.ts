import config from "../../assets-config.json";
import type { AnimationModule } from "./types";
import cssSprites from "./css-sprites";

const registry: Record<string, AnimationModule> = {
  "css-sprites": cssSprites,
};

export function getActiveAnimation(): AnimationModule {
  const name = config.animation;
  const mod = registry[name];
  if (!mod) throw new Error(`Unknown animation module: ${name}`);
  return mod;
}
