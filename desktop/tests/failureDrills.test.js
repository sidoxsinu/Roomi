const { describe, it } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { validateSensorData, SensorClient } = require('../src/main/sensorClient');

describe('Failure Drills (APP-4, T10.1)', () => {
  it('correctly rejects all variations of corrupted or malformed payloads', () => {
    const badPayloads = [
      'plain string',
      null,
      undefined,
      { temperature: 'warm', humidity: 50, sensor_status: 'online' },
      { temperature: 25, humidity: 50, sensor_status: 'unknown_status' },
      { temperature: null, humidity: null, sensor_status: 'online' },
      { temperature: 25, humidity: 50, sensor_status: 'error' },
      { temperature: 999, humidity: 50, sensor_status: 'online' },
      { temperature: 25, humidity: -5, sensor_status: 'online' }
    ];

    for (const p of badPayloads) {
      const res = validateSensorData(p);
      assert.strictEqual(res.valid, false, `Expected bad payload to fail: ${JSON.stringify(p)}`);
    }
  });

  it('detects server down and emits disconnected event on startup', async () => {
    const client = new SensorClient({
      host: '127.0.0.1',
      port: 59999,
      pollIntervalMs: 50,
      timeoutMs: 100,
      maxFailures: 2
    });

    let disconnectedEmitted = false;
    client.on('sensor:status', (s) => {
      if (!s.connected) disconnectedEmitted = true;
    });

    await client.poll();
    await client.poll();

    assert.strictEqual(disconnectedEmitted, true);
  });

  it('handles server 500 error gracefully without throwing', async () => {
    const errorServer = http.createServer((_req, res) => {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('Internal Server Error');
    });

    await new Promise((resolve) => errorServer.listen(59997, resolve));

    try {
      const client = new SensorClient({
        host: '127.0.0.1',
        port: 59997,
        pollIntervalMs: 50,
        timeoutMs: 200,
        maxFailures: 1
      });

      let statusEvent = null;
      client.on('sensor:status', (s) => {
        statusEvent = s;
      });

      await client.poll();
      assert.ok(statusEvent);
      assert.strictEqual(statusEvent.connected, false);
    } finally {
      await new Promise((resolve) => errorServer.close(resolve));
    }
  });
});
