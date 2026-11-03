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

  // Simulation Controls (APP-12)
  const simToggle = document.getElementById('simToggle');
  const simControls = document.getElementById('simControls');
  const simTemp = document.getElementById('simTemp');
  const simTempVal = document.getElementById('simTempVal');
  const simHumidity = document.getElementById('simHumidity');
  const simHumidityVal = document.getElementById('simHumidityVal');
  const simErrorBtn = document.getElementById('simErrorBtn');
  const simRecoverBtn = document.getElementById('simRecoverBtn');

  let isSimError = false;

  function pushSimulationData() {
    if (!simToggle.checked) return;
    if (window.roomiApi) {
      window.roomiApi.setSimulation({
        temperature: parseFloat(simTemp.value),
        humidity: parseFloat(simHumidity.value),
        sensor_status: isSimError ? 'error' : 'online'
      });
    }
  }

  simToggle.addEventListener('change', () => {
    if (simToggle.checked) {
      simControls.style.display = 'block';
      pushSimulationData();
    } else {
      simControls.style.display = 'none';
      if (window.roomiApi) {
        window.roomiApi.setSimulation({ enabled: false });
      }
    }
  });

  simTemp.addEventListener('input', () => {
    simTempVal.textContent = `${parseFloat(simTemp.value).toFixed(1)} °C`;
    pushSimulationData();
  });

  simHumidity.addEventListener('input', () => {
    simHumidityVal.textContent = `${Math.round(simHumidity.value)} %`;
    pushSimulationData();
  });

  simErrorBtn.addEventListener('click', () => {
    isSimError = true;
    simErrorBtn.style.display = 'none';
    simRecoverBtn.style.display = 'inline-block';
    pushSimulationData();
  });

  simRecoverBtn.addEventListener('click', () => {
    isSimError = false;
    simRecoverBtn.style.display = 'none';
    simErrorBtn.style.display = 'inline-block';
    pushSimulationData();
  });

  walkSpeedInput.addEventListener('input', () => {
    walkSpeedVal.textContent = `${walkSpeedInput.value} px/s`;
  });

  // Load current settings via IPC
  if (window.roomiApi) {
    try {
      const current = await window.roomiApi.getSettings();
      if (current) {
        if (current.selectedPet) {
          const petRadio = document.querySelector(`input[name="selectedPet"][value="${current.selectedPet}"]`);
          if (petRadio) petRadio.checked = true;
        }
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

    const selectedPetRadio = document.querySelector('input[name="selectedPet"]:checked');
    const selectedPet = selectedPetRadio ? selectedPetRadio.value : 'blob';

    const newSettings = {
      selectedPet,
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
