const fs = require('fs');
const path = require('path');

const DEFAULT_SETTINGS = {
  host: 'roomi.local',
  port: 80,
  pollIntervalMs: 3000,
  thresholds: {
    tempHigh: 30.0,
    tempLow: 18.0,
    humidityHigh: 70.0,
    humidityLow: 30.0
  },
  walkSpeedPxPerSec: 50,
  sleepAfterMinutes: 5,
  sound: false,
  simulation: false
};

/**
 * Validates and merges partial settings with defaults.
 */
function validateAndMergeSettings(raw = {}) {
  const merged = { ...DEFAULT_SETTINGS, ...raw };

  // Validate Host
  if (typeof merged.host !== 'string' || !merged.host.trim()) {
    merged.host = DEFAULT_SETTINGS.host;
  } else {
    merged.host = merged.host.trim();
  }

  // Validate Port
  const port = parseInt(merged.port, 10);
  merged.port = !isNaN(port) && port >= 1 && port <= 65535 ? port : DEFAULT_SETTINGS.port;

  // Validate Poll Interval (min 1000ms, max 60000ms)
  const poll = parseInt(merged.pollIntervalMs, 10);
  merged.pollIntervalMs = !isNaN(poll) && poll >= 1000 && poll <= 60000 ? poll : DEFAULT_SETTINGS.pollIntervalMs;

  // Validate Thresholds
  const th = raw.thresholds || {};
  merged.thresholds = {
    tempHigh: typeof th.tempHigh === 'number' && Number.isFinite(th.tempHigh) ? th.tempHigh : DEFAULT_SETTINGS.thresholds.tempHigh,
    tempLow: typeof th.tempLow === 'number' && Number.isFinite(th.tempLow) ? th.tempLow : DEFAULT_SETTINGS.thresholds.tempLow,
    humidityHigh: typeof th.humidityHigh === 'number' && Number.isFinite(th.humidityHigh) ? th.humidityHigh : DEFAULT_SETTINGS.thresholds.humidityHigh,
    humidityLow: typeof th.humidityLow === 'number' && Number.isFinite(th.humidityLow) ? th.humidityLow : DEFAULT_SETTINGS.thresholds.humidityLow
  };

  // Sanity check: tempHigh must be strictly greater than tempLow
  if (merged.thresholds.tempHigh <= merged.thresholds.tempLow) {
    merged.thresholds.tempHigh = DEFAULT_SETTINGS.thresholds.tempHigh;
    merged.thresholds.tempLow = DEFAULT_SETTINGS.thresholds.tempLow;
  }

  // Sanity check: humidityHigh must be strictly greater than humidityLow
  if (merged.thresholds.humidityHigh <= merged.thresholds.humidityLow) {
    merged.thresholds.humidityHigh = DEFAULT_SETTINGS.thresholds.humidityHigh;
    merged.thresholds.humidityLow = DEFAULT_SETTINGS.thresholds.humidityLow;
  }

  // Walk Speed (10 to 200 px/s)
  const speed = parseInt(merged.walkSpeedPxPerSec, 10);
  merged.walkSpeedPxPerSec = !isNaN(speed) && speed >= 10 && speed <= 200 ? speed : DEFAULT_SETTINGS.walkSpeedPxPerSec;

  // Sleep timeout (1 to 60 mins)
  const sleep = parseInt(merged.sleepAfterMinutes, 10);
  merged.sleepAfterMinutes = !isNaN(sleep) && sleep >= 1 && sleep <= 60 ? sleep : DEFAULT_SETTINGS.sleepAfterMinutes;

  merged.sound = Boolean(merged.sound);
  merged.simulation = Boolean(merged.simulation);

  return merged;
}

class SettingsManager {
  constructor(filePath) {
    this.filePath = filePath;
    this.settings = { ...DEFAULT_SETTINGS };
  }

  load() {
    try {
      if (this.filePath && fs.existsSync(this.filePath)) {
        const rawContent = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(rawContent);
        this.settings = validateAndMergeSettings(parsed);
      } else {
        this.settings = { ...DEFAULT_SETTINGS };
      }
    } catch (_err) {
      this.settings = { ...DEFAULT_SETTINGS };
    }
    return this.settings;
  }

  save(newSettings) {
    this.settings = validateAndMergeSettings({ ...this.settings, ...newSettings });
    if (this.filePath) {
      try {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.filePath, JSON.stringify(this.settings, null, 2), 'utf-8');
      } catch (err) {
        console.error('[ROOMI] Failed to save settings to disk:', err.message);
      }
    }
    return this.settings;
  }

  get() {
    return { ...this.settings };
  }
}

module.exports = {
  SettingsManager,
  validateAndMergeSettings,
  DEFAULT_SETTINGS
};

