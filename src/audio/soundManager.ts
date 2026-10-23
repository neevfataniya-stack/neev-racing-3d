/**
 * Procedural Web Audio API sound and music generator for NEEV RACING 3D.
 * 100% code-synthesized with zero external audio assets (0% chance of 404s, CORS failures, or missing audio files).
 * Delivers full car audio (engine, acceleration, nitro, crash, coin, powerups)
 * plus an energetic high-tempo electronic arcade racing soundtrack.
 */
export class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  // Engine audio nodes
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private isEngineRunning: boolean = false;

  // Nitro audio nodes
  private nitroNoise: AudioBufferSourceNode | null = null;
  private nitroGain: GainNode | null = null;
  private nitroFilter: BiquadFilterNode | null = null;
  private isNitroPlaying: boolean = false;

  // Racing Music engine (Synthesized 132 BPM arcade synthwave/electro track)
  private isMusicRunning: boolean = false;
  private musicIntervalId: number | null = null;
  private nextStepTime: number = 0;
  private currentStep: number = 0;
  private noiseBuffer: AudioBuffer | null = null;

  // 132 BPM -> 0.1136s per 16th note
  private readonly STEP_DURATION = 60 / 132 / 4;
  private readonly LOOKAHEAD_SEC = 0.12;
  private readonly SCHEDULE_INTERVAL_MS = 35;

  constructor() {
    // AudioContext is lazily initialized on first user interaction
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Car engine gain
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.55, this.ctx.currentTime);
      this.engineGain.connect(this.masterGain);

      // SFX gain (crashes, coins, powerups, near-misses)
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music gain (background energetic racing beat)
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.32, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Pre-generate short white noise buffer for drums/percussion
      const bufLen = Math.floor(this.ctx.sampleRate * 1.0);
      this.noiseBuffer = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked', e);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public setVolumes(engineVol: number, sfxVol: number) {
    if (this.ctx) {
      if (this.engineGain) {
        this.engineGain.gain.setValueAtTime(Math.max(0, Math.min(1, engineVol)), this.ctx.currentTime);
      }
      if (this.sfxGain) {
        this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(1, sfxVol)), this.ctx.currentTime);
      }
    }
  }

  public resumeAudio() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => console.warn('Audio resume error', err));
    }
  }

  /* =========================================================================
   * RACING BACKGROUND MUSIC (HIGH-ENERGY ARCADE SYNTHWAVE)
   * ========================================================================= */

  public startRacingMusic() {
    this.resumeAudio();
    if (!this.ctx || !this.musicGain) return;
    if (this.isMusicRunning) return; // already active

    this.isMusicRunning = true;

    // Smooth fade in
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(0.001, now);
    this.musicGain.gain.linearRampToValueAtTime(0.32, now + 0.3);

    this.currentStep = 0;
    this.nextStepTime = now + 0.05;

    // Start tick loop
    if (this.musicIntervalId) {
      window.clearInterval(this.musicIntervalId);
    }

    this.musicIntervalId = window.setInterval(() => {
      this.scheduleMusicSteps();
    }, this.SCHEDULE_INTERVAL_MS);
  }

  public stopRacingMusic() {
    if (!this.isMusicRunning) return;
    this.isMusicRunning = false;

    if (this.musicIntervalId) {
      window.clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }

    if (this.ctx && this.musicGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.linearRampToValueAtTime(0.001, now + 0.2);
    }
  }

  public pauseRacingMusic() {
    this.stopRacingMusic();
  }

  public resumeRacingMusic() {
    this.startRacingMusic();
  }

  private scheduleMusicSteps() {
    if (!this.ctx || !this.isMusicRunning || !this.musicGain) return;

    while (this.nextStepTime < this.ctx.currentTime + this.LOOKAHEAD_SEC) {
      this.playMusicStep(this.currentStep, this.nextStepTime);
      this.nextStepTime += this.STEP_DURATION;
      this.currentStep = (this.currentStep + 1) % 32; // 32 sixteenth steps = 2 bars
    }
  }

  private playMusicStep(step: number, time: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;

    // 1. Kick Drum (Steps 0, 4, 8, 12, 16, 20, 24, 28) -> Steady four-on-the-floor
    if (step % 4 === 0) {
      this.scheduleKick(time);
    }

    // 2. Snare / Clap (Steps 4, 12, 20, 28)
    if (step === 4 || step === 12 || step === 20 || step === 28) {
      this.scheduleSnare(time);
    }

    // 3. Hi-Hat (Offbeats: 2, 6, 10, 14, 18, 22, 26, 30; plus light driving 16th ticks)
    if (step % 2 === 0) {
      const isOpen = step === 10 || step === 26;
      this.scheduleHiHat(time, isOpen);
    } else if (step % 4 === 3) {
      // subtle 16th note sizzle
      this.scheduleHiHat(time, false, 0.08);
    }

    // 4. Driving Bassline (16th note electro pulse in D Minor)
    this.scheduleBass(step, time);

    // 5. High-Octane Lead Arpeggio (Energetic melody driving race forward)
    this.scheduleLeadArp(step, time);
  }

  private scheduleKick(time: number) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(38, time + 0.085);

      gain.gain.setValueAtTime(0.7, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.13);
    } catch (_) {}
  }

  private scheduleSnare(time: number) {
    if (!this.ctx || !this.musicGain || !this.noiseBuffer) return;
    try {
      // Noise burst
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, time);
      filter.Q.setValueAtTime(1.8, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.45, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.13);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.start(time);
      noise.stop(time + 0.14);

      // Body pop
      const body = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();
      body.type = 'triangle';
      body.frequency.setValueAtTime(200, time);
      body.frequency.exponentialRampToValueAtTime(65, time + 0.06);

      bodyGain.gain.setValueAtTime(0.3, time);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

      body.connect(bodyGain);
      bodyGain.connect(this.musicGain);

      body.start(time);
      body.stop(time + 0.08);
    } catch (_) {}
  }

  private scheduleHiHat(time: number, isOpen: boolean = false, volume: number = 0.22) {
    if (!this.ctx || !this.musicGain || !this.noiseBuffer) return;
    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(8000, time);

      const gain = this.ctx.createGain();
      const dur = isOpen ? 0.12 : 0.045;
      gain.gain.setValueAtTime(volume * (isOpen ? 1.2 : 1.0), time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      source.start(time);
      source.stop(time + dur + 0.01);
    } catch (_) {}
  }

  private scheduleBass(step: number, time: number) {
    if (!this.ctx || !this.musicGain) return;

    // 32-step root progression:
    // Steps 0-7: D2 (73.42 Hz) / D1
    // Steps 8-15: F2 (87.31 Hz) / G2
    // Steps 16-23: Bb1 (58.27 Hz) / Bb2
    // Steps 24-31: A1 (55.00 Hz) / C2
    const bassNotes = [
      73.42, 146.83, 73.42, 146.83, 73.42, 146.83, 73.42, 87.31,
      98.00, 196.00, 98.00, 196.00, 98.00, 196.00, 87.31, 82.41,
      58.27, 116.54, 58.27, 116.54, 58.27, 116.54, 58.27, 65.41,
      55.00, 110.00, 55.00, 110.00, 55.00, 110.00, 65.41, 69.30,
    ];

    const freq = bassNotes[step] || 73.42;

    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, time);
      filter.frequency.exponentialRampToValueAtTime(180, time + 0.08);
      filter.Q.setValueAtTime(3.5, time);

      const dur = this.STEP_DURATION * 0.85;
      gain.gain.setValueAtTime(0.24, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + dur + 0.01);
    } catch (_) {}
  }

  private scheduleLeadArp(step: number, time: number) {
    if (!this.ctx || !this.musicGain) return;

    // High energy 16th-note arcade arpeggio (D minor pentatonic/blues):
    // D4 (293.66), F4 (349.23), G4 (392.00), A4 (440.00), C5 (523.25), D5 (587.33), F5 (698.46)
    const arpNotes = [
      293.66, 349.23, 440.00, 587.33, 523.25, 440.00, 349.23, 440.00,
      392.00, 466.16, 587.33, 783.99, 698.46, 587.33, 466.16, 523.25,
      349.23, 440.00, 523.25, 698.46, 659.25, 523.25, 440.00, 523.25,
      440.00, 523.25, 659.25, 783.99, 698.46, 659.25, 587.33, 554.37,
    ];

    const freq = arpNotes[step] || 293.66;

    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, time);
      filter.Q.setValueAtTime(2.0, time);

      const dur = this.STEP_DURATION * 0.7;
      gain.gain.setValueAtTime(0.13, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + dur + 0.01);
    } catch (_) {}
  }

  /* =========================================================================
   * PROCEDURAL CAR SOUND EFFECTS (PRESERVED 100% INTACT)
   * ========================================================================= */

  public startEngine() {
    this.resumeAudio();
    if (!this.ctx || !this.engineGain || this.isEngineRunning) return;

    try {
      this.osc1 = this.ctx.createOscillator();
      this.osc2 = this.ctx.createOscillator();
      this.engineFilter = this.ctx.createBiquadFilter();

      this.osc1.type = 'sawtooth';
      this.osc2.type = 'triangle';

      this.osc1.frequency.setValueAtTime(45, this.ctx.currentTime);
      this.osc2.frequency.setValueAtTime(90, this.ctx.currentTime);

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(260, this.ctx.currentTime);
      this.engineFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      this.osc1.connect(this.engineFilter);
      this.osc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);

      this.osc1.start();
      this.osc2.start();
      this.isEngineRunning = true;
    } catch (err) {
      console.warn('Could not start procedural engine audio', err);
    }
  }

  public updateEngine(speedNormalized: number, isAccelerating: boolean) {
    if (!this.ctx || !this.isEngineRunning || !this.osc1 || !this.osc2 || !this.engineFilter) return;

    // Base idle frequency ~45Hz, at top speed ~160Hz with gear shifting simulation
    const gearCycle = (speedNormalized * 4) % 1;
    const baseFreq = 48 + speedNormalized * 90 + gearCycle * 25 + (isAccelerating ? 15 : 0);
    const filterFreq = 220 + speedNormalized * 650 + (isAccelerating ? 150 : 0);

    const now = this.ctx.currentTime;
    this.osc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
    this.osc2.frequency.setTargetAtTime(baseFreq * 2, now, 0.05);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.06);
  }

  public stopEngine() {
    if (this.osc1) {
      try {
        this.osc1.stop();
        this.osc1.disconnect();
      } catch (_) {}
      this.osc1 = null;
    }
    if (this.osc2) {
      try {
        this.osc2.stop();
        this.osc2.disconnect();
      } catch (_) {}
      this.osc2 = null;
    }
    this.isEngineRunning = false;
    this.stopNitro();
  }

  public startNitro() {
    this.resumeAudio();
    if (!this.ctx || !this.sfxGain || this.isNitroPlaying) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      this.nitroNoise = this.ctx.createBufferSource();
      this.nitroNoise.buffer = buffer;
      this.nitroNoise.loop = true;

      this.nitroFilter = this.ctx.createBiquadFilter();
      this.nitroFilter.type = 'bandpass';
      this.nitroFilter.frequency.setValueAtTime(800, this.ctx.currentTime);
      this.nitroFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      this.nitroGain = this.ctx.createGain();
      this.nitroGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.nitroGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.15);

      this.nitroNoise.connect(this.nitroFilter);
      this.nitroFilter.connect(this.nitroGain);
      this.nitroGain.connect(this.sfxGain);

      this.nitroNoise.start();
      this.isNitroPlaying = true;
    } catch (e) {
      console.warn('Could not start nitro sound', e);
    }
  }

  public stopNitro() {
    if (this.nitroGain && this.ctx) {
      try {
        this.nitroGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        setTimeout(() => {
          if (this.nitroNoise) {
            try {
              this.nitroNoise.stop();
              this.nitroNoise.disconnect();
            } catch (_) {}
            this.nitroNoise = null;
          }
          this.isNitroPlaying = false;
        }, 120);
      } catch (_) {
        this.isNitroPlaying = false;
      }
    } else {
      this.isNitroPlaying = false;
    }
  }

  public playCoin() {
    this.resumeAudio();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playPowerUp() {
    this.resumeAudio();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.25); // E6

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playNearMiss() {
    this.resumeAudio();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.2);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playShieldBreak() {
    this.resumeAudio();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playCrash() {
    this.resumeAudio();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // 1. Noise burst
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.6);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);

    // 2. Sub bass impact boom
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(120, now);
    sub.frequency.exponentialRampToValueAtTime(30, now + 0.4);

    subGain.gain.setValueAtTime(0.8, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(now);
    sub.stop(now + 0.5);
  }

  public playClick() {
    this.resumeAudio();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const soundManager = new SoundManager();
