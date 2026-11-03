const EventEmitter = require('events');

/**
 * Validates sensor payload according to the API contract.
 * @param {any} data
 * @returns {{ valid: boolean, error?: string, sanitized?: any }}
 */
function validateSensorData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Payload must be a non-null object' };
  }

  if (typeof data.sensor_status !== 'string' || !['online', 'error'].includes(data.sensor_status)) {
    return { valid: false, error: 'Invalid or missing sensor_status' };
  }

  if (data.sensor_status === 'online') {
    if (typeof data.temperature !== 'number' || !Number.isFinite(data.temperature)) {
      return { valid: false, error: 'Temperature must be a finite number when online' };
    }
    if (data.temperature < -40 || data.temperature > 85) {
      return { valid: false, error: `Temperature out of range (-40..85): ${data.temperature}` };
    }

    if (typeof data.humidity !== 'number' || !Number.isFinite(data.humidity)) {
      return { valid: false, error: 'Humidity must be a finite number when online' };
    }
    if (data.humidity < 0 || data.humidity > 100) {
      return { valid: false, error: `Humidity out of range (0..100): ${data.humidity}` };
    }
  } else {
    // On error, temperature and humidity should be null
    if (data.temperature !== null && data.temperature !== undefined) {
      return { valid: false, error: 'Temperature must be null when sensor_status is error' };
    }
    if (data.humidity !== null && data.humidity !== undefined) {
      return { valid: false, error: 'Humidity must be null when sensor_status is error' };
    }
  }

  if (data.light_raw !== null && data.light_raw !== undefined) {
    if (typeof data.light_raw !== 'number' || data.light_raw < 0 || data.light_raw > 4095) {
      return { valid: false, error: `Invalid light_raw: ${data.light_raw}` };
    }
  }

  if (data.sound_raw !== null && data.sound_raw !== undefined) {
    if (typeof data.sound_raw !== 'number' || data.sound_raw < 0 || data.sound_raw > 4095) {
      return { valid: false, error: `Invalid sound_raw: ${data.sound_raw}` };
    }
  }

  return {
    valid: true,
    sanitized: {
      device_id: typeof data.device_id === 'string' ? data.device_id : 'unknown',
      temperature: data.temperature ?? null,
      humidity: data.humidity ?? null,
      light_raw: data.light_raw ?? null,
      sound_raw: data.sound_raw ?? null,
      sensor_status: data.sensor_status,
      uptime_s: typeof data.uptime_s === 'number' ? data.uptime_s : 0,
      receivedAt: Date.now()
    }
  };
}

class SensorClient extends EventEmitter {
  constructor(options = {}) {
    super();
    this.host = options.host || 'roomi.local';
    this.port = options.port || 80;
    this.pollIntervalMs = options.pollIntervalMs || 3000;
    this.timeoutMs = options.timeoutMs || 2500;
    this.maxFailures = options.maxFailures || 3;
    this.staleAfterMs = options.staleAfterMs || 10000;

    this.timer = null;
    this.consecutiveFailures = 0;
    this.lastValidTime = 0;
    this.isConnected = false;
    this.lastReading = null;
    this.isPolling = false;
  }

  getBaseUrl() {
    // If host already includes port or protocol, parse accordingly
    if (this.host.startsWith('http://') || this.host.startsWith('https://')) {
      return this.host;
    }
    const portPart = this.port && this.port !== 80 ? `:${this.port}` : '';
    return `http://${this.host}${portPart}`;
  }

  start() {
    if (this.timer) return;
    this.poll(); // Initial poll immediately
    this.timer = setInterval(() => this.poll(), this.pollIntervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  setHost(host, port = 80) {
    this.host = host;
    this.port = port;
  }

  setPollInterval(intervalMs) {
    this.pollIntervalMs = Math.max(1000, intervalMs);
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = setInterval(() => this.poll(), this.pollIntervalMs);
    }
  }

  async poll() {
    if (this.isPolling) return;
    this.isPolling = true;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = `${this.getBaseUrl()}/data`;
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const rawJson = await response.json();
      const validation = validateSensorData(rawJson);

      if (!validation.valid) {
        throw new Error(`Validation Error: ${validation.error}`);
      }

      // Valid data received
      this.consecutiveFailures = 0;
      this.lastValidTime = Date.now();
      this.lastReading = validation.sanitized;

      if (!this.isConnected) {
        this.isConnected = true;
        this.emit('sensor:status', { connected: true });
      }

      this.emit('sensor:update', this.lastReading);
    } catch (err) {
      this.handleFailure(err.name === 'AbortError' ? 'Timeout' : err.message);
    } finally {
      clearTimeout(timeout);
      this.isPolling = false;
      this.checkStaleness();
    }
  }

  handleFailure(reason) {
    this.consecutiveFailures += 1;
    if (this.isConnected && this.consecutiveFailures >= this.maxFailures) {
      this.isConnected = false;
      this.emit('sensor:status', { connected: false, reason: `Disconnected: ${reason}` });
    }
  }

  checkStaleness() {
    if (this.isConnected && this.lastValidTime > 0) {
      const age = Date.now() - this.lastValidTime;
      if (age > this.staleAfterMs) {
        this.isConnected = false;
        this.emit('sensor:status', { connected: false, reason: `Stale data (> ${this.staleAfterMs}ms)` });
      }
    }
  }
}

module.exports = { SensorClient, validateSensorData };
