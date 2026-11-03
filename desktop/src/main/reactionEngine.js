/**
 * Pure Reaction Engine for ROOMI per docs/06-CHARACTER-BEHAVIOUR.md
 * Evaluates environmental readings and maps them to character emotional states
 * with strict priority, hysteresis bands, and consecutive reading filtering.
 */

const DEFAULT_THRESHOLDS = {
  tempHigh: 30.0,
  tempLow: 18.0,
  humidityHigh: 70.0,
  humidityLow: 30.0
};

const HYSTERESIS = {
  temp: 1.0,    // 1.0 °C band
  humidity: 3.0 // 3.0 %RH band
};

/**
 * Resolves candidate alert state and lists all active reasons.
 */
function evaluateConditions({ temperature, humidity, status, connected }, thresholds = DEFAULT_THRESHOLDS, previousState = 'happy') {
  const reasons = [];

  // Priority 1: Disconnected / Hardware Error
  if (!connected || status === 'error' || temperature === null || humidity === null) {
    if (!connected) reasons.push('Sensor disconnected');
    else if (status === 'error') reasons.push('Sensor read error');
    else reasons.push('No sensor reading');
    return { candidateState: 'disconnected', reasons };
  }

  // Evaluate Temperature with Hysteresis
  let isHot = false;
  let isCold = false;

  if (previousState === 'hot') {
    // Leave hot only if dropped below (tempHigh - hysteresis)
    isHot = temperature > (thresholds.tempHigh - HYSTERESIS.temp);
  } else {
    // Enter hot if exceeded tempHigh
    isHot = temperature > thresholds.tempHigh;
  }

  if (previousState === 'cold') {
    // Leave cold only if risen above (tempLow + hysteresis)
    isCold = temperature < (thresholds.tempLow + HYSTERESIS.temp);
  } else {
    // Enter cold if below tempLow
    isCold = temperature < thresholds.tempLow;
  }

  if (isHot) reasons.push('Temperature high');
  if (isCold) reasons.push('Temperature low');

  // Evaluate Humidity with Hysteresis
  let isHumid = false;
  let isDry = false;

  if (previousState === 'humid') {
    isHumid = humidity > (thresholds.humidityHigh - HYSTERESIS.humidity);
  } else {
    isHumid = humidity > thresholds.humidityHigh;
  }

  if (previousState === 'dry') {
    isDry = humidity < (thresholds.humidityLow + HYSTERESIS.humidity);
  } else {
    isDry = humidity < thresholds.humidityLow;
  }

  if (isHumid) reasons.push('Humidity high');
  if (isDry) reasons.push('Humidity low');

  // Priority Ranking: Temperature outranks Humidity per PRD / 06 spec
  let candidateState = 'happy';
  if (isHot) {
    candidateState = 'hot';
  } else if (isCold) {
    candidateState = 'cold';
  } else if (isHumid) {
    candidateState = 'humid';
  } else if (isDry) {
    candidateState = 'dry';
  }

  return { candidateState, reasons };
}

/**
 * State resolver including 2-reading stability filter.
 */
function resolveState(
  reading,
  thresholds = DEFAULT_THRESHOLDS,
  previousState = 'happy',
  tracker = { candidate: 'happy', count: 0 }
) {
  const { candidateState, reasons } = evaluateConditions(reading, thresholds, previousState);

  // If candidate is already the previous state, reset tracker
  if (candidateState === previousState) {
    return {
      state: previousState,
      reasons,
      tracker: { candidate: candidateState, count: 0 }
    };
  }

  // Disconnected state transitions immediately without requiring consecutive confirmation
  if (candidateState === 'disconnected') {
    return {
      state: 'disconnected',
      reasons,
      tracker: { candidate: 'disconnected', count: 0 }
    };
  }

  // Consecutive reading check (requires 2 consecutive identical readings to switch away from previousState)
  const REQUIRED_CONSECUTIVE = 2;
  const newCount = (tracker.candidate === candidateState ? tracker.count : 0) + 1;

  if (newCount >= REQUIRED_CONSECUTIVE) {
    return {
      state: candidateState,
      reasons,
      tracker: { candidate: candidateState, count: 0 }
    };
  }

  // Not yet reached required consecutive readings, retain previous state
  return {
    state: previousState,
    reasons,
    tracker: { candidate: candidateState, count: newCount }
  };
}

module.exports = {
  resolveState,
  evaluateConditions,
  DEFAULT_THRESHOLDS,
  HYSTERESIS
};
