export interface AudioConfig {
  calm: string;
  annoying: string;
  switchAtMs: number;
}

export class AudioController {
  private calmAudio: HTMLAudioElement;
  private annoyingAudio: HTMLAudioElement;
  private switchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private config: AudioConfig) {
    this.calmAudio = new Audio(config.calm);
    this.calmAudio.loop = true;
    this.annoyingAudio = new Audio(config.annoying);
    this.annoyingAudio.loop = true;
  }

  start() {
    this.calmAudio.play().catch((e) => console.error("calm audio play failed:", e));
    this.switchTimer = setTimeout(() => {
      this.calmAudio.pause();
      this.annoyingAudio.play().catch((e) => console.error("annoying audio play failed:", e));
    }, this.config.switchAtMs);
  }

  stop() {
    if (this.switchTimer) {
      clearTimeout(this.switchTimer);
      this.switchTimer = null;
    }
    this.calmAudio.pause();
    this.annoyingAudio.pause();
  }
}
