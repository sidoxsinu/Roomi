// Settings Window Logic
window.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('settings-form');
  const hostInput = document.getElementById('host');
  const portInput = document.getElementById('port');
  const pollInput = document.getElementById('pollInterval');
  const tempHighInput = document.getElementById('tempHigh');
  const tempLowInput = document.getElementById('tempLow');
  const humHighInput = document.getElementById('humidityHigh');
  const humLowInput = document.getElementById('humidityLow');
  const walkSpeedInput = document.getElementById('walkSpeed');
  const walkSpeedVal = document.getElementById('walkSpeedVal');
  const sleepAfterInput = document.getElementById('sleepAfter');
  const savedMsg = document.getElementById('saved-msg');

  walkSpeedInput.addEventListener('input', () => {
    walkSpeedVal.textContent = `${walkSpeedInput.value} px/s`;
  });

  // Load current settings via IPC
  if (window.roomiApi) {
    try {
      const current = await window.roomiApi.getSettings();
      if (current) {
        hostInput.value = current.host || 'roomi.local';
        portInput.value = current.port || 80;
        pollInput.value = Math.round((current.pollIntervalMs || 3000) / 1000);
        if (current.thresholds) {
          tempHighInput.value = current.thresholds.tempHigh;
          tempLowInput.value = current.thresholds.tempLow;
          humHighInput.value = current.thresholds.humidityHigh;
          humLowInput.value = current.thresholds.humidityLow;
        }
        walkSpeedInput.value = current.walkSpeedPxPerSec || 50;
        walkSpeedVal.textContent = `${walkSpeedInput.value} px/s`;
        sleepAfterInput.value = current.sleepAfterMinutes || 5;
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }

  // Handle Save
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newSettings = {
      host: hostInput.value.trim(),
      port: parseInt(portInput.value, 10),
      pollIntervalMs: Math.max(1, parseInt(pollInput.value, 10)) * 1000,
      thresholds: {
        tempHigh: parseFloat(tempHighInput.value),
        tempLow: parseFloat(tempLowInput.value),
        humidityHigh: parseFloat(humHighInput.value),
        humidityLow: parseFloat(humLowInput.value)
      },
      walkSpeedPxPerSec: parseInt(walkSpeedInput.value, 10),
      sleepAfterMinutes: parseInt(sleepAfterInput.value, 10)
    };

    if (window.roomiApi) {
      try {
        await window.roomiApi.saveSettings(newSettings);
        savedMsg.style.display = 'inline-block';
        setTimeout(() => {
          savedMsg.style.display = 'none';
        }, 3000);
      } catch (err) {
        console.error('Failed to save settings:', err);
      }
    }
  });
});
