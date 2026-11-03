const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { validateAndMergeSettings, SettingsManager, DEFAULT_SETTINGS } = require('../src/main/settings');

describe('Settings Validation & Merging (APP-9, APP-14)', () => {
  it('returns default settings when given empty object', () => {
    const res = validateAndMergeSettings({});
    assert.deepStrictEqual(res, DEFAULT_SETTINGS);
  });

  it('merges valid partial settings cleanly', () => {
    const custom = {
      host: '192.168.1.50',
      port: 8080,
      pollIntervalMs: 5000,
      thresholds: {
        tempHigh: 32,
        tempLow: 19
      }
    };
    const res = validateAndMergeSettings(custom);
    assert.strictEqual(res.host, '192.168.1.50');
    assert.strictEqual(res.port, 8080);
    assert.strictEqual(res.pollIntervalMs, 5000);
    assert.strictEqual(res.thresholds.tempHigh, 32);
    assert.strictEqual(res.thresholds.tempLow, 19);
    assert.strictEqual(res.thresholds.humidityHigh, 70); // Retains default
  });

  it('resets inverted thresholds (tempHigh <= tempLow) to defaults', () => {
    const bad = {
      thresholds: {
        tempHigh: 15,
        tempLow: 25
      }
    };
    const res = validateAndMergeSettings(bad);
    assert.strictEqual(res.thresholds.tempHigh, DEFAULT_SETTINGS.thresholds.tempHigh);
    assert.strictEqual(res.thresholds.tempLow, DEFAULT_SETTINGS.thresholds.tempLow);
  });

  it('validates selectedPet and falls back to default on invalid pet name', () => {
    const valid = validateAndMergeSettings({ selectedPet: 'cat' });
    assert.strictEqual(valid.selectedPet, 'cat');

    const penguin = validateAndMergeSettings({ selectedPet: 'penguin' });
    assert.strictEqual(penguin.selectedPet, 'penguin');

    const robot = validateAndMergeSettings({ selectedPet: 'robot' });
    assert.strictEqual(robot.selectedPet, 'robot');

    const invalid = validateAndMergeSettings({ selectedPet: 'dinosaur' });
    assert.strictEqual(invalid.selectedPet, DEFAULT_SETTINGS.selectedPet);
  });

  it('validates soundEnabled and soundVolume boundaries', () => {
    const muted = validateAndMergeSettings({ soundEnabled: false });
    assert.strictEqual(muted.soundEnabled, false);
    assert.strictEqual(muted.sound, false);

    const customVol = validateAndMergeSettings({ soundVolume: 45 });
    assert.strictEqual(customVol.soundVolume, 45);

    const clampedLow = validateAndMergeSettings({ soundVolume: -20 });
    assert.strictEqual(clampedLow.soundVolume, DEFAULT_SETTINGS.soundVolume);

    const clampedHigh = validateAndMergeSettings({ soundVolume: 150 });
    assert.strictEqual(clampedHigh.soundVolume, DEFAULT_SETTINGS.soundVolume);
  });

  it('persists and loads settings from temporary disk file', () => {
    const tempFile = path.join(os.tmpdir(), `roomi-test-settings-${Date.now()}.json`);
    try {
      const manager = new SettingsManager(tempFile);
      manager.save({ host: 'my-node.local', walkSpeedPxPerSec: 75 });

      const reloader = new SettingsManager(tempFile);
      const loaded = reloader.load();
      assert.strictEqual(loaded.host, 'my-node.local');
      assert.strictEqual(loaded.walkSpeedPxPerSec, 75);
      assert.strictEqual(loaded.pollIntervalMs, DEFAULT_SETTINGS.pollIntervalMs);
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
  });
});

