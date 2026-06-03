import { describe, it, expect } from "vitest";
import { getActiveAnimation } from "./index";

describe("animation registry", () => {
  it("returns the module named in assets-config.json", () => {
    const mod = getActiveAnimation();
    expect(mod.name).toBe("css-sprites");
    expect(typeof mod.Component).toBe("function");
    expect(mod.audio.switchAtMs).toBe(2500);
  });
});
