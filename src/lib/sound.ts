/**
 * Acoustic physical modeling synthesizer for realistic wooden chess pieces
 * on a solid wooden Ashtāpada board.
 * Uses Web Audio API with transient noise filtering, dual wood-body resonance,
 * and weighted base impact modeling.
 */
class SoundFX {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.createNoiseBuffer(this.ctx);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Pre-computes a short buffer of noise for transient wood impact attacks
   */
  private createNoiseBuffer(ctx: AudioContext) {
    const bufferSize = ctx.sampleRate * 0.1; // 100ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Realistic single wooden piece placement on a wooden board.
   * Produces a crisp wood surface clack + hollow board body resonance + weighted base tap.
   */
  public playMove() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Micro-pitch variation (±3%) so repeated moves sound organic and natural
    const pitchJitter = 0.97 + Math.random() * 0.06;

    // 1. Wood Impact Transient (High-Frequency Crisp "Clack" of polished lacquer)
    if (this.noiseBuffer) {
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(3200 * pitchJitter, now);
      bandpass.Q.setValueAtTime(3.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.32, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

      noiseSource.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.025);
    }

    // 2. Wooden Board Cavity Resonance (Hollow Wood Knock ~310Hz)
    const woodBody = ctx.createOscillator();
    const woodBodyGain = ctx.createGain();

    woodBody.type = 'triangle';
    woodBody.frequency.setValueAtTime(420 * pitchJitter, now);
    woodBody.frequency.exponentialRampToValueAtTime(260 * pitchJitter, now + 0.015);
    woodBody.frequency.exponentialRampToValueAtTime(180 * pitchJitter, now + 0.075);

    woodBodyGain.gain.setValueAtTime(0.42, now);
    woodBodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    woodBody.connect(woodBodyGain);
    woodBodyGain.connect(ctx.destination);

    woodBody.start(now);
    woodBody.stop(now + 0.085);

    // 3. Weighted Base / Table Thud (Low Sub Impact ~110Hz)
    const baseThud = ctx.createOscillator();
    const baseGain = ctx.createGain();

    baseThud.type = 'sine';
    baseThud.frequency.setValueAtTime(130 * pitchJitter, now);
    baseThud.frequency.exponentialRampToValueAtTime(70 * pitchJitter, now + 0.04);

    baseGain.gain.setValueAtTime(0.28, now);
    baseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    baseThud.connect(baseGain);
    baseGain.connect(ctx.destination);

    baseThud.start(now);
    baseThud.stop(now + 0.05);
  }

  /**
   * Realistic wooden piece capture: Two wooden pieces striking each other
   * followed immediately by the capturing piece landing firmly on the board.
   * Produces an unmistakable satisfying double-clack!
   */
  public playCapture() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const pitchJitter = 0.98 + Math.random() * 0.04;

    // === Impact 1: Piece-on-piece collision at t = 0 ===
    if (this.noiseBuffer) {
      const pieceNoise = ctx.createBufferSource();
      pieceNoise.buffer = this.noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(4200 * pitchJitter, now);
      bandpass.Q.setValueAtTime(3.8, now);

      const pieceGain = ctx.createGain();
      pieceGain.gain.setValueAtTime(0.45, now);
      pieceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      pieceNoise.connect(bandpass);
      bandpass.connect(pieceGain);
      pieceGain.connect(ctx.destination);

      pieceNoise.start(now);
      pieceNoise.stop(now + 0.02);
    }

    const pieceClack = ctx.createOscillator();
    const pieceClackGain = ctx.createGain();
    pieceClack.type = 'triangle';
    pieceClack.frequency.setValueAtTime(540 * pitchJitter, now);
    pieceClack.frequency.exponentialRampToValueAtTime(360 * pitchJitter, now + 0.02);

    pieceClackGain.gain.setValueAtTime(0.4, now);
    pieceClackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    pieceClack.connect(pieceClackGain);
    pieceClackGain.connect(ctx.destination);

    pieceClack.start(now);
    pieceClack.stop(now + 0.04);

    // === Impact 2: Capturing piece landing firmly on the board at t = 22ms ===
    const t2 = now + 0.022;

    if (this.noiseBuffer) {
      const boardNoise = ctx.createBufferSource();
      boardNoise.buffer = this.noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(2600 * pitchJitter, t2);
      bandpass.Q.setValueAtTime(2.5, t2);

      const boardNoiseGain = ctx.createGain();
      boardNoiseGain.gain.setValueAtTime(0.35, t2);
      boardNoiseGain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.025);

      boardNoise.connect(bandpass);
      bandpass.connect(boardNoiseGain);
      boardNoiseGain.connect(ctx.destination);

      boardNoise.start(t2);
      boardNoise.stop(t2 + 0.03);
    }

    const boardResonance = ctx.createOscillator();
    const boardGain = ctx.createGain();

    boardResonance.type = 'triangle';
    boardResonance.frequency.setValueAtTime(380 * pitchJitter, t2);
    boardResonance.frequency.exponentialRampToValueAtTime(170 * pitchJitter, t2 + 0.07);

    boardGain.gain.setValueAtTime(0.5, t2);
    boardGain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.08);

    boardResonance.connect(boardGain);
    boardGain.connect(ctx.destination);

    boardResonance.start(t2);
    boardResonance.stop(t2 + 0.085);

    // Heavy bass thump for the capture
    const heavyThud = ctx.createOscillator();
    const heavyGain = ctx.createGain();
    heavyThud.type = 'sine';
    heavyThud.frequency.setValueAtTime(140 * pitchJitter, t2);
    heavyThud.frequency.exponentialRampToValueAtTime(60 * pitchJitter, t2 + 0.05);

    heavyGain.gain.setValueAtTime(0.35, t2);
    heavyGain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.055);

    heavyThud.connect(heavyGain);
    heavyGain.connect(ctx.destination);

    heavyThud.start(t2);
    heavyThud.stop(t2 + 0.06);
  }

  /**
   * Check: Solid hardwood gavel / alert wood strike with resonant acoustic overtone.
   */
  public playCheck() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sharp strike
    if (this.noiseBuffer) {
      const strikeNoise = ctx.createBufferSource();
      strikeNoise.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(4500, now);
      filter.Q.setValueAtTime(4.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      strikeNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      strikeNoise.start(now);
      strikeNoise.stop(now + 0.025);
    }

    // Hardwood block resonance (dual harmonic wood tone)
    const woodFrequencies = [280, 720];
    woodFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.22);

      gain.gain.setValueAtTime(idx === 0 ? 0.38 : 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    });
  }

  /**
   * Victory: Resonant rosewood marimba arpeggio (warm wooden bars).
   */
  public playVictory() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // C4, E4, G4, C5 on warm wooden bars
    const marimbaFrequencies = [261.63, 329.63, 392.0, 523.25];

    marimbaFrequencies.forEach((freq, idx) => {
      const noteTime = now + idx * 0.11;

      // Mallet felt click
      if (this.noiseBuffer) {
        const malletNoise = ctx.createBufferSource();
        malletNoise.buffer = this.noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2400, noteTime);
        filter.Q.setValueAtTime(2.0, noteTime);

        const mGain = ctx.createGain();
        mGain.gain.setValueAtTime(0.18, noteTime);
        mGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.015);

        malletNoise.connect(filter);
        filter.connect(mGain);
        mGain.connect(ctx.destination);

        malletNoise.start(noteTime);
        malletNoise.stop(noteTime + 0.02);
      }

      // Wooden bar fundamental
      const barOsc = ctx.createOscillator();
      const barGain = ctx.createGain();
      barOsc.type = 'triangle';
      barOsc.frequency.setValueAtTime(freq, noteTime);

      // Wooden bar overtone (harmonic 4x)
      const overtoneOsc = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtoneOsc.type = 'sine';
      overtoneOsc.frequency.setValueAtTime(freq * 4, noteTime);

      barGain.gain.setValueAtTime(0.25, noteTime);
      barGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.32);

      overtoneGain.gain.setValueAtTime(0.08, noteTime);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.1);

      barOsc.connect(barGain);
      barGain.connect(ctx.destination);

      overtoneOsc.connect(overtoneGain);
      overtoneGain.connect(ctx.destination);

      barOsc.start(noteTime);
      barOsc.stop(noteTime + 0.34);

      overtoneOsc.start(noteTime);
      overtoneOsc.stop(noteTime + 0.12);
    });
  }

  /**
   * Mistake / Blunder: Dull, hollow, muffled wooden tap.
   */
  public playMistake() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }
}

export const soundFx = new SoundFX();
