const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { SoundFxEngine } = require('../src/renderer/audio/soundFx');

// Lightweight Mock of Web Audio API
class MockGain {
  constructor() {
    this.value = 1;
    this.connectedTo = null;
    this.gain = {
      value: 1,
      setValueAtTime: (val, _time) => { this.gain.value = val; },
      exponentialRampToValueAtTime: (val, _time) => { this.gain.value = val; }
    };
  }
  connect(dest) {
    this.connectedTo = dest;
  }
}

class MockOscillator {
  constructor() {
    this.type = 'sine';
    this.frequency = {
      value: 440,
      setValueAtTime: (val, _time) => { this.frequency.value = val; },
      exponentialRampToValueAtTime: (val, _time) => { this.frequency.value = val; }
    };
    this.connectedTo = null;
    this.started = false;
    this.stopped = false;
  }
  connect(dest) {
    this.connectedTo = dest;
  }
  start(_time) {
    this.started = true;
  }
  stop(_time) {
    this.stopped = true;
  }
}

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = new MockGain();
    this.oscillators = [];
    this.gains = [];
  }
  createGain() {
    const g = new MockGain();
    this.gains.push(g);
    return g;
  }
  createOscillator() {
    const osc = new MockOscillator();
    this.oscillators.push(osc);
    return osc;
  }
  async resume() {
    this.state = 'running';
  }
}

describe('Web Audio Procedural Sound Effects Engine', () => {
  let engine;

  beforeEach(() => {
    engine = new SoundFxEngine({
      AudioContext: MockAudioContext,
      enabled: true,
      volume: 80,
      activePet: 'blob'
    });
  });

  it('initializes context and master volume on demand', () => {
    const ctx = engine.initContext();
    assert.ok(ctx);
    assert.strictEqual(ctx.state, 'running');
    assert.strictEqual(engine.enabled, true);
    assert.strictEqual(engine.volume, 80);
  });

  it('updates volume and mute settings cleanly', () => {
    engine.initContext();
    engine.updateSettings({ enabled: false });
    assert.strictEqual(engine.enabled, false);
    assert.strictEqual(engine.masterGain.gain.value, 0);

    engine.updateSettings({ enabled: true, volume: 50, pet: 'cat' });
    assert.strictEqual(engine.enabled, true);
    assert.strictEqual(engine.volume, 50);
    assert.strictEqual(engine.activePet, 'cat');
  });

  it('does not generate sound when disabled or volume is 0', () => {
    engine.updateSettings({ enabled: false });
    const tone = engine.createTone('sine', 440, 0.1);
    assert.strictEqual(tone, null);

    engine.updateSettings({ enabled: true, volume: 0 });
    const toneZero = engine.createTone('sine', 440, 0.1);
    assert.strictEqual(toneZero, null);
  });

  it('synthesizes interaction sounds (jump, speech, question)', () => {
    engine.initContext();
    
    engine.playJump();
    assert.ok(engine.ctx.oscillators.length >= 1);
    const jumpOsc = engine.ctx.oscillators[engine.ctx.oscillators.length - 1];
    assert.strictEqual(jumpOsc.started, true);

    engine.playSpeechBubble();
    assert.ok(engine.ctx.oscillators.length >= 2);

    engine.playQuestion();
    assert.ok(engine.ctx.oscillators.length >= 3);
  });

  it('plays distinctive vocalizations for all 4 pets', () => {
    engine.initContext();
    const startCount = engine.ctx.oscillators.length;

    // Blob
    engine.playPetVocal('blob');
    assert.ok(engine.ctx.oscillators.length > startCount);

    // Cat
    const beforeCat = engine.ctx.oscillators.length;
    engine.playPetVocal('cat');
    assert.ok(engine.ctx.oscillators.length > beforeCat);

    // Penguin
    const beforePenguin = engine.ctx.oscillators.length;
    engine.playPetVocal('penguin');
    assert.ok(engine.ctx.oscillators.length > beforePenguin);

    // Robot (plays arpeggio chords)
    const beforeRobot = engine.ctx.oscillators.length;
    engine.playPetVocal('robot');
    assert.ok(engine.ctx.oscillators.length >= beforeRobot + 3);
  });

  it('triggers synthesized reactions for all 8 emotional and environmental states', () => {
    engine.initContext();
    const states = ['happy', 'hot', 'cold', 'humid', 'dry', 'disconnected', 'sleeping', 'wake'];

    for (const st of states) {
      const before = engine.ctx.oscillators.length;
      engine.playStateReaction(st);
      assert.ok(engine.ctx.oscillators.length > before, `Expected oscillators scheduled for state: ${st}`);
    }
  });
});
