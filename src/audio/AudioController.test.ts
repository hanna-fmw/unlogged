import { describe, it, expect, vi, beforeEach } from "vitest";
import { AudioController } from "./AudioController";

class FakeAudio {
  src = "";
  loop = false;
  volume = 1;
  paused = true;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn(() => {
    this.paused = true;
  });
}

beforeEach(() => {
  // @ts-expect-error replacing global for test
  globalThis.Audio = FakeAudio;
});

describe("AudioController", () => {
  it("plays calm immediately and switches to annoying at switchAtMs", () => {
    vi.useFakeTimers();
    const c = new AudioController({ calm: "/c.mp3", annoying: "/a.mp3", switchAtMs: 1000 });
    c.start();

    const calm = (c as unknown as { calmAudio: FakeAudio }).calmAudio;
    const annoying = (c as unknown as { annoyingAudio: FakeAudio }).annoyingAudio;

    expect(calm.play).toHaveBeenCalledTimes(1);
    expect(annoying.play).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(calm.pause).toHaveBeenCalled();
    expect(annoying.play).toHaveBeenCalledTimes(1);

    c.stop();
    expect(annoying.pause).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
