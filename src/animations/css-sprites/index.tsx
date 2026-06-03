import type { AnimationModule } from "../types";

const cssSprites: AnimationModule = {
  name: "css-sprites",
  Component: () => null,
  audio: {
    calm: "/src/audio/calm.mp3",
    annoying: "/src/audio/annoying.mp3",
    switchAtMs: 2500,
  },
};

export default cssSprites;
