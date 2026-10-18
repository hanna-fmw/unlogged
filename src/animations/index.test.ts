import { describe, expect, it } from "vitest";
import config from "../../assets-config.json";
import { getActiveAnimation } from "./index";

describe("animation registry", () => {
  it("returns the module named in assets-config.json", () => {
    const mod = getActiveAnimation();
    expect(mod.name).toBe(config.animation);
    expect(typeof mod.Component).toBe("function");
    expect(typeof mod.audio.switchAtMs).toBe("number");
  });
});
