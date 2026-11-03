// ROOMI Renderer Entry Point
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pet-container');
  const characterTarget = document.getElementById('character');
  const infoPanel = document.getElementById('info-panel');
  const speechBubble = document.getElementById('speech-bubble');
  const speechText = document.getElementById('speech-text');

  const valTemp = document.getElementById('val-temp');
  const valHumidity = document.getElementById('val-humidity');
  const valLight = document.getElementById('val-light');
  const valSound = document.getElementById('val-sound');
  const panelExtra = document.getElementById('panel-extra');
  const panelStatusDot = document.getElementById('panel-status-dot');
  const panelStatusText = document.getElementById('panel-status-text');
  const panelReasons = document.getElementById('panel-reasons');
  const panelSimBadge = document.getElementById('panel-sim-badge');

  const character = new Character(characterTarget);

  let isHovering = false;
  let isDragging = false;
  let hasDragged = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panelHideTimer = null;
  let speechHideTimer = null;

  const SPEECH_MESSAGES = {
    happy: ["Feeling comfortable! ☀️", "Nice room conditions! ✨", "All good here! 😊"],
    hot: ["It's toasty in here! 🌡️", "A bit warm today! ☀️", "Fanning myself! ♨️"],
    cold: ["Brrr... chilly! ❄️", "A little cold in here! 🧤", "Shivering a bit! 🧊"],
    humid: ["Feels muggy! 💧", "A bit sticky in here! 🌧️"],
    dry: ["Air feels dry! 🥤", "Could use a sip of water! 🏜️"],
    disconnected: ["Searching for sensor... ❓", "Where's the ESP32? 📡"],
    sleeping: ["Zzz... 🌙", "Taking a catnap... 💤"],
    click: ["Wheee! ✨", "Hi there! 👋", "Bouncy bounce! 🎈"]
  };

  function showSpeech(text, durationMs = 3500) {
    if (speechHideTimer) clearTimeout(speechHideTimer);
    speechText.textContent = text;
    speechBubble.classList.remove('hidden');

    speechHideTimer = setTimeout(() => {
      speechBubble.classList.add('hidden');
    }, durationMs);
  }

  function triggerStateSpeech(state) {
    const petId = character.currentPetId || 'blob';
    let msg = '';

    if (state === 'click') {
      if (petId === 'cat') {
        const catMsgs = ['Purrrrr! ✨', 'Meow! 🐾', 'Head bumps! 🐱'];
        msg = catMsgs[Math.floor(Math.random() * catMsgs.length)];
      } else if (petId === 'penguin') {
        const penguMsgs = ['Noot noot! 🐧', 'Waddle waddle! ❄️', 'Flipper wave! ✨'];
        msg = penguMsgs[Math.floor(Math.random() * penguMsgs.length)];
      } else if (petId === 'robot') {
        const botMsgs = ['Beep boop! 🤖', 'Diagnostics: Optimal! ⚡', 'Ping received! 📡'];
        msg = botMsgs[Math.floor(Math.random() * botMsgs.length)];
      } else {
        msg = SPEECH_MESSAGES.click[Math.floor(Math.random() * SPEECH_MESSAGES.click.length)];
      }
    } else {
      const list = SPEECH_MESSAGES[state] || SPEECH_MESSAGES.happy;
      msg = list[Math.floor(Math.random() * list.length)];
    }
    showSpeech(msg);
  }

  function showPanel() {
    if (panelHideTimer) clearTimeout(panelHideTimer);
    infoPanel.classList.remove('hidden');
  }

  function hidePanelAfter(ms = 3500) {
    if (panelHideTimer) clearTimeout(panelHideTimer);
    panelHideTimer = setTimeout(() => {
      if (!isHovering) {
        infoPanel.classList.add('hidden');
      }
    }, ms);
  }

  // Robust forwarded-event hover detection (APP-10)
  window.addEventListener('mousemove', (event) => {
    if (isDragging) {
      const dx = event.screenX - dragStartX;
      const dy = event.screenY - dragStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged = true;
      }
      if (window.roomiApi) {
        window.roomiApi.dragMove({ dx, dy });
      }
      return;
    }

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const isOverCharacter = target && (target.closest('#character') || target.closest('#info-panel') || target.closest('#speech-bubble'));

    if (isOverCharacter && !isHovering) {
      isHovering = true;
      showPanel();
      if (window.roomiApi) {
        window.roomiApi.setHover(true);
      }
    } else if (!isOverCharacter && isHovering) {
      isHovering = false;
      hidePanelAfter(2000);
      if (window.roomiApi) {
        window.roomiApi.setHover(false);
      }
    }
  });

  document.addEventListener('mouseleave', () => {
    if (isHovering && !isDragging) {
      isHovering = false;
      hidePanelAfter(500);
      if (window.roomiApi) {
        window.roomiApi.setHover(false);
      }
    }
  });

  // Manual Drag and Click Interaction (APP-7)
  characterTarget.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return; // Left click only
    isDragging = true;
    hasDragged = false;
    dragStartX = event.screenX;
    dragStartY = event.screenY;

    if (window.roomiApi) {
      window.roomiApi.dragStart();
    }
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;

    if (window.roomiApi) {
      window.roomiApi.dragEnd();
    }

    if (!hasDragged) {
      // It was a click! (APP-7)
      character.jump();
      const clickMsg = SPEECH_MESSAGES.click[Math.floor(Math.random() * SPEECH_MESSAGES.click.length)];
      showSpeech(clickMsg, 2000);
      showPanel();
      hidePanelAfter(4000);
      if (window.roomiApi) {
        window.roomiApi.interactClick();
      }
    }
  });

  if (window.roomiApi) {
    // Listen to live pet model changes (APP-9 extension)
    window.roomiApi.onPetChange((petId) => {
      character.setPet(petId);
      triggerStateSpeech('happy');
    });

    // Load initial pet from persisted settings
    window.roomiApi.getSettings().then((settings) => {
      if (settings && settings.selectedPet) {
        character.setPet(settings.selectedPet);
      }
    }).catch(console.error);

    // Listen to walker direction updates
    window.roomiApi.onWalkerDirection(({ dir, walking }) => {
      character.setDirection(dir, walking);
    });

    // Performance: Pause CSS animations when window is hidden (T10.2)
    window.roomiApi.onVisibilityChange((isVisible) => {
      if (isVisible) {
        document.body.classList.remove('paused-anim');
      } else {
        document.body.classList.add('paused-anim');
      }
    });

    // Listen to character state updates (APP-5)
    let previousState = 'happy';
    window.roomiApi.onCharacterState(({ state, reasons }) => {
      character.setState(state);

      if (reasons && reasons.length > 0) {
        panelReasons.textContent = reasons.join(', ');
        panelReasons.style.display = 'block';
      } else {
        panelReasons.style.display = 'none';
      }

      // Trigger friendly speech bubble on meaningful state change
      if (state !== previousState) {
        previousState = state;
        triggerStateSpeech(state);
      }
    });

    // Listen to sensor data updates (APP-6)
    window.roomiApi.onSensorUpdate((data) => {
      if (data.temperature !== null && Number.isFinite(data.temperature)) {
        valTemp.textContent = `${data.temperature.toFixed(1)} °C`;
      } else {
        valTemp.textContent = '--';
      }

      if (data.humidity !== null && Number.isFinite(data.humidity)) {
        valHumidity.textContent = `${Math.round(data.humidity)} %`;
      } else {
        valHumidity.textContent = '--';
      }

      if (data.light_raw !== null || data.sound_raw !== null) {
        panelExtra.style.display = 'flex';
        valLight.textContent = data.light_raw !== null ? `Light: ${data.light_raw} (raw)` : 'Light: --';
        valSound.textContent = data.sound_raw !== null ? `Sound: ${data.sound_raw} (raw)` : 'Sound: --';
      } else {
        panelExtra.style.display = 'none';
      }

      if (data.isSimulation) {
        panelSimBadge.style.display = 'inline-block';
      } else {
        panelSimBadge.style.display = 'none';
      }
    });

    // Listen to sensor connection status (APP-6)
    window.roomiApi.onSensorStatus(({ connected }) => {
      if (connected) {
        panelStatusDot.className = 'status-dot online';
        panelStatusText.textContent = 'Online';
      } else {
        panelStatusDot.className = 'status-dot offline';
        panelStatusText.textContent = 'Offline';
        valTemp.textContent = '--';
        valHumidity.textContent = '--';
      }
    });
  }

  // Expose character for testing and interaction
  window.character = character;
  window.showSpeech = showSpeech;
});
