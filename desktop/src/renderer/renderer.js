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
  const soundFx = typeof SoundFxEngine !== 'undefined' ? new SoundFxEngine() : null;

  setTimeout(() => {
    showSpeech('I am staying safely on screen! 🛡️', 5000);
  }, 400);

  // Confetti celebration helper
  function fireConfetti() {
    if (typeof confetti === 'function') {
      const confettiCanvas = document.getElementById('confetti-canvas');
      if (confettiCanvas) {
        const myConfetti = confetti.create(confettiCanvas, { resize: true });
        myConfetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#34d399', '#38bdf8', '#fbbf24', '#f472b6']
        });
      }
    }
  }

  let isHovering = false;
  let isDragging = false;
  let hasDragged = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panelHideTimer = null;
  let speechHideTimer = null;

  const SPEECH_MESSAGES = {
    happy: ["Robotic telemetry nominal! 🤖", "Ambient conditions optimal! ✨", "Digital twin synchronized! ⚡"],
    hot: ["Thermal alert on physical robot! 🌡️", "Overheating warning! ♨️", "Cooling vents engaged! ☀️"],
    cold: ["Low temperature alert! ❄️", "Sub-optimal operating climate! 🧤", "Thermal protection active! 🧊"],
    humid: ["Moisture threshold exceeded! 💧", "High humidity detected! 🌧️"],
    dry: ["Arid atmosphere detected! 🏜️", "Static electricity warning! ⚡"],
    disconnected: ["Searching for Physical Robot... 📡", "Waiting for ESP32 beacon... ❓"],
    sleeping: ["Low-power standby mode... 💤", "Power saving cycle active... 🌙"],
    click: ["Beep boop! 🤖", "Digital twin active! ⚡", "Telemetry synced with physical robot! 📡"]
  };

  function showSpeech(text, durationMs = 3500) {
    if (speechHideTimer) clearTimeout(speechHideTimer);
    speechText.textContent = text;
    speechBubble.classList.remove('hidden');

    if (soundFx) {
      if (text.includes('?')) {
        soundFx.playQuestion();
      } else {
        soundFx.playSpeechBubble();
      }
    }

    speechHideTimer = setTimeout(() => {
      speechBubble.classList.add('hidden');
    }, durationMs);
  }

  function triggerStateSpeech(state) {
    const petId = character.currentPetId || 'robot';
    let msg = '';

    if (state === 'click') {
      if (petId === 'robot') {
        const botMsgs = ['Beep boop! 🤖', 'Diagnostics: Optimal! ⚡', 'Ping acknowledged! 📡', 'Physical robot twin online! ⚙️'];
        msg = botMsgs[Math.floor(Math.random() * botMsgs.length)];
      } else if (petId === 'cat') {
        const catMsgs = ['Purrrrr! ✨', 'Meow! 🐾', 'Head bumps! 🐱'];
        msg = catMsgs[Math.floor(Math.random() * catMsgs.length)];
      } else if (petId === 'penguin') {
        const penguMsgs = ['Noot noot! 🐧', 'Waddle waddle! ❄️', 'Flipper wave! ✨'];
        msg = penguMsgs[Math.floor(Math.random() * penguMsgs.length)];
      } else {
        const blobMsgs = ['Wheee! ✨', 'Hi there! 👋', 'Bouncy bounce! 🎈'];
        msg = blobMsgs[Math.floor(Math.random() * blobMsgs.length)];
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
      if (soundFx) {
        soundFx.playJump();
        soundFx.playPetVocal(character.currentPetId || 'blob');
      }
      triggerStateSpeech('click');
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
      if (soundFx) {
        soundFx.updateSettings({ pet: petId });
        soundFx.playPetVocal(petId);
      }
      triggerStateSpeech('happy');
    });

    // Listen to settings updates (volume, sound toggle, pet)
    window.roomiApi.onSettingsChange((settings) => {
      if (settings && soundFx) {
        soundFx.updateSettings({
          enabled: settings.soundEnabled,
          volume: settings.soundVolume,
          pet: settings.selectedPet
        });
      }
    });

    // Load initial pet and sound preferences from persisted settings
    window.roomiApi.getSettings().then((settings) => {
      if (settings) {
        const pet = settings.selectedPet || 'robot';
        character.setPet(pet);
        if (soundFx) {
          soundFx.updateSettings({
            enabled: settings.soundEnabled,
            volume: settings.soundVolume,
            pet
          });
        }
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

      // Trigger sound and friendly speech bubble on meaningful state change
      if (state !== previousState) {
        if (soundFx) {
          if (previousState === 'sleeping' && state !== 'sleeping') {
            soundFx.playWake();
          } else {
            soundFx.playStateReaction(state);
            if (state === 'happy') {
              fireConfetti();
              soundFx.playCelebration();
            }
          }
        }
        previousState = state;
        triggerStateSpeech(state);
      }
    });

    // Airborne Drag & Drop Physics Feedback
    let lastWhooshTime = 0;
    window.roomiApi.onDragState(({ isDragging, isAirborne, vx, vy }) => {
      if (isDragging) {
        characterTarget.classList.add('pet-airborne');
        const tilt = Math.max(-25, Math.min(25, (vx || 0) * 0.04));
        characterTarget.style.transform = `rotate(${tilt}deg) scale(0.96, 1.04)`;

        const speed = Math.hypot(vx || 0, vy || 0);
        const now = Date.now();
        if (speed > 480 && now - lastWhooshTime > 400 && soundFx) {
          lastWhooshTime = now;
          soundFx.playWhoosh();
        }
      } else if (!isAirborne) {
        characterTarget.classList.remove('pet-airborne');
        characterTarget.style.transform = '';
      }
    });

    window.roomiApi.onPhysicsUpdate(({ vx, isAirborne }) => {
      if (isAirborne) {
        characterTarget.classList.add('pet-airborne');
        const tilt = Math.max(-20, Math.min(20, (vx || 0) * 0.03));
        characterTarget.style.transform = `rotate(${tilt}deg)`;
      } else {
        characterTarget.classList.remove('pet-airborne');
        characterTarget.style.transform = '';
      }
    });

    window.roomiApi.onLand(({ impactVelocity }) => {
      characterTarget.classList.remove('pet-airborne');
      characterTarget.style.transform = '';

      // Landing squash-and-stretch
      characterTarget.classList.remove('landing-squash');
      void characterTarget.offsetWidth; // Reflow
      characterTarget.classList.add('landing-squash');

      setTimeout(() => {
        characterTarget.classList.remove('landing-squash');
      }, 350);

      // Play impact audio
      if (soundFx) {
        soundFx.playLandThud(impactVelocity);
      }

      if (impactVelocity > 450) {
        const landMsgs = ['Safe landing! ✨', 'Wheee! 🎈', 'Oof, that was a drop! 💫', 'Bounce! 🐾'];
        showSpeech(landMsgs[Math.floor(Math.random() * landMsgs.length)], 2200);
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

  // Expose character and soundFx for testing and interaction
  window.character = character;
  window.soundFx = soundFx;
  window.showSpeech = showSpeech;
});
