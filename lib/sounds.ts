type SoundId = "complete" | "allClear" | "tick" | "tap";

class SoundManager {
  private audioContext: AudioContext | null = null;
  private isMuted = false;

  async init(): Promise<void> {
    if (this.audioContext) return;
    this.audioContext = new AudioContext();
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = "sine") {
    if (this.isMuted || !this.audioContext) return;
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  play(soundId: SoundId) {
    if (this.isMuted || !this.audioContext) return;

    switch (soundId) {
      case "complete":
        this.playTone(523, 0.1, "sine");
        setTimeout(() => this.playTone(659, 0.1, "sine"), 100);
        setTimeout(() => this.playTone(784, 0.2, "sine"), 200);
        break;
      case "allClear":
        [523, 659, 784, 1047].forEach((freq, i) => {
          setTimeout(() => this.playTone(freq, 0.3, "sine"), i * 150);
        });
        break;
      case "tick":
        this.playTone(800, 0.05, "sine");
        break;
      case "tap":
        this.playTone(600, 0.05, "sine");
        break;
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  get muted() {
    return this.isMuted;
  }

  setMuted(v: boolean) {
    this.isMuted = v;
  }
}

export const soundManager = new SoundManager();
