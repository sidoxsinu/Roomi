const { describe, it } = require('node:test');
const assert = require('node:assert');
const { validateSensorData } = require('../src/main/sensorClient');

describe('Sensor Data Validation (APP-4)', () => {
  it('accepts a valid online reading', () => {
    const raw = {
      device_id: 'roomi-node-1',
      temperature: 28.4,
      humidity: 62.5,
      light_raw: 850,
      sound_raw: 120,
      sensor_status: 'online',
      uptime_s: 3600
    };
    const res = validateSensorData(raw);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.sanitized.temperature, 28.4);
    assert.strictEqual(res.sanitized.humidity, 62.5);
    assert.strictEqual(res.sanitized.sensor_status, 'online');
  });

  it('accepts error status with null temperature and humidity', () => {
    const raw = {
      device_id: 'roomi-node-1',
      temperature: null,
      humidity: null,
      light_raw: null,
      sound_raw: null,
      sensor_status: 'error',
      uptime_s: 120
    };
    const res = validateSensorData(raw);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.sanitized.sensor_status, 'error');
    assert.strictEqual(res.sanitized.temperature, null);
  });

  it('rejects invalid or missing sensor_status', () => {
    const raw = { temperature: 25, humidity: 50 };
    const res = validateSensorData(raw);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /sensor_status/);
  });

  it('rejects out of range temperature', () => {
    const raw = { temperature: 95.0, humidity: 50, sensor_status: 'online' };
    const res = validateSensorData(raw);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /Temperature out of range/);
  });

  it('rejects out of range humidity', () => {
    const raw = { temperature: 25.0, humidity: 105, sensor_status: 'online' };
    const res = validateSensorData(raw);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /Humidity out of range/);
  });

  it('rejects NaN or non-finite values', () => {
    const raw = { temperature: NaN, humidity: 50, sensor_status: 'online' };
    const res = validateSensorData(raw);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /finite number/);
  });

  it('rejects non-null readings when sensor_status is error (APP-4 / FW-4 rule)', () => {
    const raw = { temperature: 25.0, humidity: 50, sensor_status: 'error' };
    const res = validateSensorData(raw);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /must be null when sensor_status is error/);
  });
});
