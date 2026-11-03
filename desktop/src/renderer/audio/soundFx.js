/**
 * Web Audio API Procedural Sound Effects Engine for ROOMI
 * 
 * Provides zero-dependency, low-latency, synthesized sound effects for:
 * 1. Emotional / Environmental States: happy, hot, cold, humid, dry, disconnected, sleeping, wake
 * 2. Pet-Specific Vocalizations:
 *    - blob: squishy bubbly bloop
 *    - cat: cute kitten meow / purr chirp
 *    - penguin: cheerful arctic squawk / flipper flutter
 *    - robot: 8-bit retro bleeps and chirp arpeggios
 * 3. Interactions:
 *    - jump / click: springy bounce
 *    - speech / bubble: dialogue pop
 *    - question: curious rising inflection
 */

class SoundFxEngine {
  constructor(options = {}) {
    this.AudioContextClass = options.AudioContext || (typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null);
    this.ctx = null;
    this.masterGain = null;
    this.enabled = options.enabled !== undefined ? options.enabled : true;
    this.volume = options.volume !== undefined ? options.volume : 70; // 0 to 100
    this.activePet = options.activePet || 'blob';
  }

  /**
   * Initializes or resumes the AudioContext on user interaction.
   */
  initContext() {
    if (!this.AudioContextClass) return null;
    if (!this.ctx) {
      this.ctx = new this.AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.updateMasterVolume();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  updateSettings({ enabled, volume, pet }) {
    if (enabled !== undefined) this.enabled = Boolean(enabled);
    if (volume !== undefined) this.volume = Math.max(0, Math.min(100, Number(volume)));
    if (pet !== undefined) this.activePet = pet;
    this.updateMasterVolume();
  }

  updateMasterVolume() {
    if (!this.masterGain || !this.ctx) return;
    const effectiveVol = this.enabled ? (this.volume / 100) * 0.35 : 0; // Cap at 0.35 to avoid loud blasts
    const now = this.ctx.currentTime || 0;
    if (this.masterGain.gain.setValueAtTime) {
      this.masterGain.gain.setValueAtTime(effectiveVol, now);
    } else {
      this.masterGain.gain.value = effectiveVol;
    }
  }

  /**
   * Helper to build a sound graph with an oscillator and gain envelope.
   */
  createTone(type, startFreq, duration, envelope = {}) {
    const ctx = this.initContext();
    if (!ctx || !this.enabled || this.volume <= 0) return null;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, now);

    const attack = envelope.attack || 0.01;
    const decay = envelope.decay || duration;
    const peak = envelope.peak !== undefined ? envelope.peak : 0.8;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + attack + decay + 0.05);

    return { osc, gain, now };
  }

  /* -------------------------------------------------------------
   * Interaction Sounds (Click, Jump, Speech, Question)
   * ------------------------------------------------------------- */

  playJump() {
    const tone = this.createTone('sine', 220, 0.16, { attack: 0.01, decay: 0.15, peak: 0.7 });
    if (!tone) return;
    const { osc, now } = tone;
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.15);
  }

  playSpeechBubble() {
    const tone = this.createTone('sine', 480, 0.09, { attack: 0.005, decay: 0.08, peak: 0.5 });
    if (!tone) return;
    const { osc, now } = tone;
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);
  }

  playQuestion() {
    // Curious inquisitive rising tone inflection
    const tone = this.createTone('triangle', 380, 0.22, { attack: 0.02, decay: 0.2, peak: 0.6 });
    if (!tone) return;
    const { osc, now } = tone;
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.2);
  }

  playLandThud(impactVelocity = 300) {
    // Satisfying low physical impact thump scaled to impact speed
    const normalized = Math.min(1.0, Math.max(0.2, (impactVelocity || 300) / 800));
    const startFreq = 120 + normalized * 40;
    const tone = this.createTone('sine', startFreq, 0.18, {
      attack: 0.005,
      decay: 0.16,
      peak: 0.5 + normalized * 0.4
    });
    if (!tone) return;
    const { osc, now } = tone;
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
  }

  playWhoosh() {
    // Soft air swoosh for fast momentum throws
    const tone = this.createTone('triangle', 320, 0.25, { attack: 0.05, decay: 0.2, peak: 0.4 });
    if (!tone) return;
    const { osc, now } = tone;
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);
  }

  playCelebration() {
    // Bright celebratory sparkle chime for happy confetti
    const ctx = this.initContext();
    if (!ctx || !this.enabled || this.volume <= 0) return;

    const pitches = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    pitches.forEach((freq, idx) => {
      const now = ctx.currentTime + (idx * 0.04);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.4, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.22);
    });
  }

  /* -------------------------------------------------------------
   * Pet-Specific Vocalizations (on Click / Greeting)
   * ------------------------------------------------------------- */

  playPetVocal(petId = this.activePet) {
    switch (petId) {
      case 'cat':
        this.playCatMeow();
        break;
      case 'penguin':
        this.playPenguinSquawk();
        break;
      case 'robot':
        this.playRobotBleep();
        break;
      case 'blob':
      default:
        this.playBlobSquish();
        break;
    }
  }

  playBlobSquish() {
    // Bubbly sine squish
    const tone = this.createTone('sine', 260, 0.18, { attack: 0.01, decay: 0.17, peak: 0.7 });
    if (!tone) return;
    const { osc, now } = tone;
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(310, now + 0.16);
  }

  playCatMeow() {
    // Cute cat meow: frequency starts at 640Hz, glides to 880Hz, softens to 700Hz
    const tone = this.createTone('sine', 640, 0.28, { attack: 0.03, decay: 0.25, peak: 0.6 });
    if (!tone) return;
    const { osc, now } = tone;
    osc.frequency.exponentialRampToValueAtTime(890, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.26);
  }

  playPenguinSquawk() {
    // Cheerful flipper squawk using triangle wave
    const tone = this.createTone('triangle', 340, 0.18, { attack: 0.02, decay: 0.16, peak: 0.6 });
    if (!tone) return;
    const { osc, now } = tone;
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(390, now + 0.14);
  }

  playRobotBleep() {
    // 8-bit retro square arpeggio bleeps
    const ctx = this.initContext();
    if (!ctx || !this.enabled || this.volume <= 0) return;

    const notes = [587.33, 880.00, 1174.66]; // D5, A5, D6
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + (idx * 0.05);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.35, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    });
  }

  /* -------------------------------------------------------------
   * Environmental Emotion Sounds
   * ------------------------------------------------------------- */

  playStateReaction(state) {
    switch (state) {
      case 'happy':
        this.playHappy();
        break;
      case 'hot':
        this.playHot();
        break;
      case 'cold':
        this.playCold();
        break;
      case 'humid':
        this.playHumid();
        break;
      case 'dry':
        this.playDry();
        break;
      case 'disconnected':
        this.playDisconnected();
        break;
      case 'sleeping':
        this.playSleeping();
        break;
      case 'wake':
        this.playWake();
        break;
      default:
        break;
    }
  }

  playHappy() {
    // Cheerful rising major triad arpeggio (C5, E5, G5)
    const ctx = this.initContext();
    if (!ctx || !this.enabled || this.volume <= 0) return;

    const pitches = [523.25, 659.25, 783.99];
    pitches.forEach((freq, idx) => {
      const now = ctx.currentTime + (idx * 0.07);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.5, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.13);
    });
  }

  playHot() {
    // Lethargic downward sigh / pant
    const tone = this.createTone('triangle', 340, 0.35, { attack: 0.04, decay: 0.3, peak: 0.6 });
    if (!tone) return;
    const { osc, now } = tone;
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.32);
  }

  playCold() {
    // Shivering teeth chattering staccato clicks
    const ctx = this.initContext();
    if (!ctx || !this.enabled || this.volume <= 0) return;

    [0, 0.06, 0.12, 0.18].forEach((delay) => {
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.4, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
    });
  }

  playHumid() {
    // Water drop bloop
    const tone = this.createTone('sine', 320, 0.18, { attack: 0.01, decay: 0.16, peak: 0.65 });
    if (!tone) return;
    const { osc, now } = tone;
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
  }

  playDry() {
    // Hollow dry clack
    const tone = this.createTone('triangle', 480, 0.14, { attack: 0.005, decay: 0.12, peak: 0.55 });
    if (!tone) return;
    const { osc, now } = tone;
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.1);
  }

  playDisconnected() {
    // Confused descending tritone chime
    const ctx = this.initContext();
    if (!ctx || !this.enabled || this.volume <= 0) return;

    const tones = [
      { freq: 440, delay: 0 },
      { freq: 311.13, delay: 0.12 }
    ];

    tones.forEach(({ freq, delay }) => {
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.5, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.2);
    });
  }

  playSleeping() {
    // Gentle lullaby breathing chord
    const tone = this.createTone('sine', 261.63, 0.5, { attack: 0.1, decay: 0.38, peak: 0.4 });
    if (!tone) return;
    const { osc, now } = tone;
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.45);
  }

  playWake() {
    // Bright waking chirp
    const tone = this.createTone('sine', 380, 0.16, { attack: 0.01, decay: 0.14, peak: 0.6 });
    if (!tone) return;
    const { osc, now } = tone;
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.14);
  }
}

if (typeof module !== 'undefined') {
  module.exports = { SoundFxEngine };
}
