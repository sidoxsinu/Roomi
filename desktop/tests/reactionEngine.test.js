const { describe, it } = require('node:test');
const assert = require('node:assert');
const { resolveState, evaluateConditions, DEFAULT_THRESHOLDS } = require('../src/main/reactionEngine');

describe('Reaction Engine Priority Rules (APP-5, 06-SPEC)', () => {
  it('priority 1: returns disconnected when sensor is disconnected', () => {
    const reading = { temperature: 35.0, humidity: 80.0, status: 'online', connected: false };
    const res = evaluateConditions(reading, DEFAULT_THRESHOLDS, 'happy');
    assert.strictEqual(res.candidateState, 'disconnected');
    assert.ok(res.reasons.includes('Sensor disconnected'));
  });

  it('priority 1: returns disconnected when status is error', () => {
    const reading = { temperature: null, humidity: null, status: 'error', connected: true };
    const res = evaluateConditions(reading, DEFAULT_THRESHOLDS, 'happy');
    assert.strictEqual(res.candidateState, 'disconnected');
    assert.ok(res.reasons.includes('Sensor read error'));
  });

  it('priority 2: hot outranks humid when both thresholds are exceeded', () => {
    const reading = { temperature: 32.0, humidity: 75.0, status: 'online', connected: true };
    const res = evaluateConditions(reading, DEFAULT_THRESHOLDS, 'happy');
    assert.strictEqual(res.candidateState, 'hot');
    // Reasons must include BOTH out-of-range indicators per spec
    assert.ok(res.reasons.includes('Temperature high'));
    assert.ok(res.reasons.includes('Humidity high'));
  });

  it('priority 2: cold outranks dry when both thresholds are exceeded', () => {
    const reading = { temperature: 15.0, humidity: 20.0, status: 'online', connected: true };
    const res = evaluateConditions(reading, DEFAULT_THRESHOLDS, 'happy');
    assert.strictEqual(res.candidateState, 'cold');
    assert.ok(res.reasons.includes('Temperature low'));
    assert.ok(res.reasons.includes('Humidity low'));
  });

  it('priority 3: returns humid when humidity is high and temperature is normal', () => {
    const reading = { temperature: 24.0, humidity: 76.0, status: 'online', connected: true };
    const res = evaluateConditions(reading, DEFAULT_THRESHOLDS, 'happy');
    assert.strictEqual(res.candidateState, 'humid');
    assert.deepStrictEqual(res.reasons, ['Humidity high']);
  });

  it('priority 4: returns happy when everything is inside comfort bounds', () => {
    const reading = { temperature: 23.5, humidity: 50.0, status: 'online', connected: true };
    const res = evaluateConditions(reading, DEFAULT_THRESHOLDS, 'happy');
    assert.strictEqual(res.candidateState, 'happy');
    assert.strictEqual(res.reasons.length, 0);
  });
});

describe('Reaction Engine Hysteresis Band (06-SPEC)', () => {
  it('prevents rapid toggling near tempHigh threshold', () => {
    // 1. Enter hot at 30.5
    let cond = evaluateConditions({ temperature: 30.5, humidity: 50, status: 'online', connected: true }, DEFAULT_THRESHOLDS, 'happy');
    assert.strictEqual(cond.candidateState, 'hot');

    // 2. Temp drops slightly to 29.5 (below 30.0, but within 1.0C hysteresis band of 29.0)
    cond = evaluateConditions({ temperature: 29.5, humidity: 50, status: 'online', connected: true }, DEFAULT_THRESHOLDS, 'hot');
    assert.strictEqual(cond.candidateState, 'hot', 'Must remain hot within hysteresis band');

    // 3. Temp drops cleanly to 28.9 (below 29.0)
    cond = evaluateConditions({ temperature: 28.9, humidity: 50, status: 'online', connected: true }, DEFAULT_THRESHOLDS, 'hot');
    assert.strictEqual(cond.candidateState, 'happy', 'Must transition to happy once past hysteresis band');
  });

  it('prevents rapid toggling near humidityHigh threshold', () => {
    // 1. Enter humid at 71%
    let cond = evaluateConditions({ temperature: 24.0, humidity: 71, status: 'online', connected: true }, DEFAULT_THRESHOLDS, 'happy');
    assert.strictEqual(cond.candidateState, 'humid');

    // 2. Humidity drops slightly to 68% (within 3% hysteresis band: 70 - 3 = 67%)
    cond = evaluateConditions({ temperature: 24.0, humidity: 68, status: 'online', connected: true }, DEFAULT_THRESHOLDS, 'humid');
    assert.strictEqual(cond.candidateState, 'humid', 'Must remain humid within hysteresis band');

    // 3. Humidity drops to 66%
    cond = evaluateConditions({ temperature: 24.0, humidity: 66, status: 'online', connected: true }, DEFAULT_THRESHOLDS, 'humid');
    assert.strictEqual(cond.candidateState, 'happy', 'Must transition to happy once below 67%');
  });
});

describe('Reaction Engine Consecutive Reading Filter', () => {
  it('requires 2 consecutive readings before transitioning away from previous state', () => {
    let reading = { temperature: 31.0, humidity: 50, status: 'online', connected: true };

    // 1st reading: candidate is hot, but count is 1 -> remains happy
    let step1 = resolveState(reading, DEFAULT_THRESHOLDS, 'happy', { candidate: 'happy', count: 0 });
    assert.strictEqual(step1.state, 'happy');
    assert.strictEqual(step1.tracker.candidate, 'hot');
    assert.strictEqual(step1.tracker.count, 1);

    // 2nd reading: candidate is hot again, count reaches 2 -> transitions to hot
    let step2 = resolveState(reading, DEFAULT_THRESHOLDS, 'happy', step1.tracker);
    assert.strictEqual(step2.state, 'hot');
    assert.strictEqual(step2.tracker.count, 0);
  });
});
