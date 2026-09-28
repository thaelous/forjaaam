// Web Audio API Synthesizer for Heavy Industrial Forge 4000T Machinery
// Zero external audio files required, runs 100% reliably in any browser

class ForgeSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Motor / Flywheel continuous drone nodes
  private motorGain: GainNode | null = null;
  private motorOsc: OscillatorNode | null = null;
  private subHumOsc: OscillatorNode | null = null;

  // Induction coil high-frequency buzz
  private inductionGain: GainNode | null = null;
  private inductionOsc: OscillatorNode | null = null;

  private isInitialized: boolean = false;

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. Motor Drone Sub-system
      this.motorGain = this.ctx.createGain();
      this.motorGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      const motorFilter = this.ctx.createBiquadFilter();
      motorFilter.type = 'lowpass';
      motorFilter.frequency.setValueAtTime(220, this.ctx.currentTime);

      this.motorOsc = this.ctx.createOscillator();
      this.motorOsc.type = 'sawtooth';
      this.motorOsc.frequency.setValueAtTime(48, this.ctx.currentTime); // ~48-75 Hz motor hum

      this.subHumOsc = this.ctx.createOscillator();
      this.subHumOsc.type = 'sine';
      this.subHumOsc.frequency.setValueAtTime(32, this.ctx.currentTime); // deep rumble

      this.motorOsc.connect(motorFilter);
      this.subHumOsc.connect(motorFilter);
      motorFilter.connect(this.motorGain);
      this.motorGain.connect(this.masterGain);

      this.motorOsc.start();
      this.subHumOsc.start();

      // 2. Induction Coil High-Frequency Buzz (subtle electromagnetic hum)
      this.inductionGain = this.ctx.createGain();
      this.inductionGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      const indFilter = this.ctx.createBiquadFilter();
      indFilter.type = 'bandpass';
      indFilter.frequency.setValueAtTime(800, this.ctx.currentTime);
      indFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      this.inductionOsc = this.ctx.createOscillator();
      this.inductionOsc.type = 'sawtooth';
      this.inductionOsc.frequency.setValueAtTime(120, this.ctx.currentTime); // 120Hz line ripple

      this.inductionOsc.connect(indFilter);
      indFilter.connect(this.inductionGain);
      this.inductionGain.connect(this.masterGain);

      this.inductionOsc.start();

      this.isInitialized = true;
    } catch {
      // AudioContext might be blocked until user gesture
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
  }

  public updateMotorSpeed(spm: number, isRunning: boolean) {
    if (!this.ctx || !this.motorOsc || !this.motorGain || !this.subHumOsc) return;

    if (!isRunning) {
      // Motor idling or stopped
      this.motorGain.gain.setTargetAtTime(0.01, this.ctx.currentTime, 0.2);
      this.motorOsc.frequency.setTargetAtTime(24, this.ctx.currentTime, 0.5);
      this.subHumOsc.frequency.setTargetAtTime(18, this.ctx.currentTime, 0.5);
      return;
    }

    // Normal running pitch proportional to SPM (45 SPM default -> ~52 Hz base)
    const targetFreq = 30 + (spm / 75) * 45;
    this.motorOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    this.subHumOsc.frequency.setTargetAtTime(targetFreq * 0.5, this.ctx.currentTime, 0.1);
    this.motorGain.gain.setTargetAtTime(0.08, this.ctx.currentTime, 0.1);
  }

  // 4000 TON HYDRAULIC/MECHANICAL HAMMER IMPACT
  public playForgeImpact(spm: number) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;

    // Layer 1: Massive Sub-Bass Shockwave (sub 40Hz thud)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(85, t);
    subOsc.frequency.exponentialRampToValueAtTime(20, t + 0.35);

    subGain.gain.setValueAtTime(1.0, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.6);

    // Layer 2: Metallic Die Clank / Clatter (die tool collision)
    const clankOsc = this.ctx.createOscillator();
    const clankGain = this.ctx.createGain();
    const clankFilter = this.ctx.createBiquadFilter();
    clankOsc.type = 'triangle';
    clankOsc.frequency.setValueAtTime(480, t);
    clankOsc.frequency.exponentialRampToValueAtTime(110, t + 0.18);

    clankFilter.type = 'bandpass';
    clankFilter.frequency.setValueAtTime(650, t);
    clankFilter.Q.setValueAtTime(5.0, t);

    clankGain.gain.setValueAtTime(0.7, t);
    clankGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    clankOsc.connect(clankFilter);
    clankFilter.connect(clankGain);
    clankGain.connect(this.masterGain);
    clankOsc.start(t);
    clankOsc.stop(t + 0.25);

    // Layer 3: Industrial Hot Steam / Scale Blowoff (Pneumatic Hiss)
    const bufferSize = this.ctx.sampleRate * 0.35;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1200, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(400, t + 0.3);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.45, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    whiteNoise.start(t);
  }

  // Pneumatic clutch engagement / single stroke trigger
  public playClutchClick() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(240, t);
    clickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.08);

    clickGain.gain.setValueAtTime(0.3, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickOsc.start(t);
    clickOsc.stop(t + 0.1);
  }

  // UI Button Click beep
  public playUiClick() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.05);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }
}

export const forgeAudio = new ForgeSoundEngine();
