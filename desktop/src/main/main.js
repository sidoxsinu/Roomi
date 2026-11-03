const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { createCharacterWindow } = require('./window');
const { setupTray } = require('./tray');
const { Walker } = require('./walker');
const { SensorClient } = require('./sensorClient');
const { resolveState } = require('./reactionEngine');
const { SettingsManager } = require('./settings');
const { PhysicsDropEngine } = require('./physics');

let mainWindow = null;
let settingsWindow = null;
let tray = null;
let walker = null;
let physicsEngine = null;
let sensorClient = null;
let settingsManager = null;
let currentSettings = null;
let dragOriginWinPos = null;
let dragPositions = [];

// Sleep Inactivity State Management (APP-8)
let sleepTimer = null;
let isSleeping = false;
let currentResolvedState = 'happy';
let stateTracker = { candidate: 'happy', count: 0 };
let lastReading = null;

// Simulation Mode State (APP-12)
let isSimulationMode = false;
let simulationData = {
  temperature: 24.5,
  humidity: 55.0,
  sensor_status: 'online',
  light_raw: null,
  sound_raw: null
};

function emitCharacterState(state, reasons = []) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('character:state', { state, reasons });
  }
}

function emitSensorUpdate(data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('sensor:update', {
      ...data,
      isSimulation: isSimulationMode
    });
  }
}

function emitSensorStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('sensor:status', status);
  }
}

function resetInactivity() {
  if (sleepTimer) clearTimeout(sleepTimer);

  if (isSleeping) {
    isSleeping = false;
    if (walker) walker.resume('sleeping');
    emitCharacterState(currentResolvedState);
  }

  const timeoutMs = (currentSettings?.sleepAfterMinutes || 5) * 60 * 1000;
  sleepTimer = setTimeout(() => {
    // Sleep only applies when resolved state is happy per 06-CHARACTER-BEHAVIOUR.md
    if (currentResolvedState === 'happy' && !isSleeping) {
      isSleeping = true;
      if (walker) walker.pause('sleeping');
      emitCharacterState('sleeping');
    }
  }, timeoutMs);
}

function handleSensorReading(reading) {
  if (isSimulationMode) return; // Simulation overrides real sensor

  lastReading = reading;
  emitSensorUpdate(reading);

  const resolved = resolveState(
    {
      temperature: reading.temperature,
      humidity: reading.humidity,
      status: reading.sensor_status,
      connected: sensorClient ? sensorClient.isConnected : false
    },
    currentSettings.thresholds,
    currentResolvedState,
    stateTracker
  );

  stateTracker = resolved.tracker;
  const previousState = currentResolvedState;
  currentResolvedState = resolved.state;

  // Rule: Any alert state wakes the pet from sleep immediately
  if (isSleeping && currentResolvedState !== 'happy') {
    isSleeping = false;
    if (walker) walker.resume('sleeping');
  }

  // Emit state to renderer if not sleeping (or if just awakened)
  if (!isSleeping || previousState !== currentResolvedState) {
    if (!isSleeping) {
      emitCharacterState(currentResolvedState, resolved.reasons);
    }
  }

  // Adjust walker speed based on character state (06-SPEC)
  if (walker) {
    if (currentResolvedState === 'disconnected') {
      walker.speedPxPerSec = 15; // Slow confused wander
    } else if (currentResolvedState === 'hot') {
      walker.speedPxPerSec = 32; // Slower walking when hot
    } else if (currentResolvedState === 'cold') {
      walker.speedPxPerSec = 36; // Shivering short steps
    } else {
      walker.speedPxPerSec = currentSettings.walkSpeedPxPerSec || 50;
    }
  }
}

function handleSensorStatus({ connected, reason }) {
  if (isSimulationMode) return;
  emitSensorStatus({ connected, reason });

  if (!connected) {
    const resolved = resolveState(
      {
        temperature: null,
        humidity: null,
        status: 'error',
        connected: false
      },
      currentSettings.thresholds,
      currentResolvedState,
      stateTracker
    );

    currentResolvedState = resolved.state;
    if (isSleeping) {
      isSleeping = false;
      if (walker) walker.resume('sleeping');
    }
    emitCharacterState('disconnected', resolved.reasons);
  }
}

function applySimulationReading() {
  const isErr = simulationData.sensor_status === 'error';
  const reading = {
    device_id: 'roomi-sim-node',
    temperature: isErr ? null : simulationData.temperature,
    humidity: isErr ? null : simulationData.humidity,
    light_raw: isErr ? null : simulationData.light_raw,
    sound_raw: isErr ? null : simulationData.sound_raw,
    sensor_status: simulationData.sensor_status,
    uptime_s: 9999,
    receivedAt: Date.now(),
    isSimulation: true
  };

  emitSensorUpdate(reading);
  emitSensorStatus({ connected: !isErr, isSimulation: true });

  const resolved = resolveState(
    {
      temperature: reading.temperature,
      humidity: reading.humidity,
      status: reading.sensor_status,
      connected: !isErr
    },
    currentSettings.thresholds,
    currentResolvedState,
    stateTracker
  );

  stateTracker = resolved.tracker;
  currentResolvedState = resolved.state;

  if (isSleeping && currentResolvedState !== 'happy') {
    isSleeping = false;
    if (walker) walker.resume('sleeping');
  }

  if (!isSleeping) {
    emitCharacterState(currentResolvedState, resolved.reasons);
  }
}

function openSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 480,
    height: 720,
    title: 'ROOMI Settings',
    resizable: true,
    minimizable: true,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  settingsWindow.loadFile(path.join(__dirname, '../settings/settings.html'));

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function initApp() {
  // Load settings (APP-14)
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  settingsManager = new SettingsManager(settingsPath);
  currentSettings = settingsManager.load();

  mainWindow = createCharacterWindow();

  // Setup system tray menu (APP-11)
  tray = setupTray(mainWindow, {
    onOpenSettings: openSettingsWindow,
    isSimulation: isSimulationMode,
    onToggleSimulation: () => {
      isSimulationMode = !isSimulationMode;
      if (isSimulationMode) {
        applySimulationReading();
      } else if (sensorClient) {
        sensorClient.poll();
      }
      if (tray) tray.destroy();
      tray = setupTray(mainWindow, {
        onOpenSettings: openSettingsWindow,
        isSimulation: isSimulationMode
      });
    }
  });

  // Setup Walker moving the window (APP-2)
  walker = new Walker(mainWindow, {
    speedPxPerSec: currentSettings.walkSpeedPxPerSec
  });
  walker.start();

  // Setup Physics Drop Engine for drag-and-drop gravity
  physicsEngine = new PhysicsDropEngine();

  // Send persisted pet selection to renderer on load
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('character:pet', currentSettings.selectedPet);
    mainWindow.webContents.send('settings:change', currentSettings);
  });

  // Performance: pause walker and animations when hidden (T10.2)
  mainWindow.on('hide', () => {
    if (walker) walker.pause('hidden');
    mainWindow.webContents.send('app:visibility', false);
  });

  mainWindow.on('show', () => {
    if (walker) walker.resume('hidden');
    mainWindow.webContents.send('app:visibility', true);
  });

  // Setup Sensor Client (APP-3, APP-4)
  sensorClient = new SensorClient({
    host: process.env.ROOMI_HOST || currentSettings.host,
    port: parseInt(process.env.ROOMI_PORT || currentSettings.port, 10),
    pollIntervalMs: currentSettings.pollIntervalMs
  });

  sensorClient.on('sensor:update', handleSensorReading);
  sensorClient.on('sensor:status', handleSensorStatus);

  // Check if CLI --sim flag is passed
  if (process.argv.includes('--sim') || currentSettings.simulation) {
    isSimulationMode = true;
    setTimeout(() => applySimulationReading(), 500);
  } else {
    sensorClient.start();
  }

  // Initialize inactivity sleep timer
  resetInactivity();

  // IPC listener for hover-based click-through (APP-10)
  ipcMain.on('hover:set', (_event, isHovering) => {
    resetInactivity();
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (isHovering) {
        mainWindow.setIgnoreMouseEvents(false);
      } else {
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
      }
    }
  });

  // Manual Drag Interactions with Real Physics & Gravity (APP-7)
  ipcMain.on('drag:start', () => {
    resetInactivity();
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (physicsEngine) physicsEngine.stop();
    dragOriginWinPos = mainWindow.getPosition();
    dragPositions = [{ time: Date.now(), pos: dragOriginWinPos }];
    if (walker) walker.pause('drag');
    mainWindow.webContents.send('character:drag', { isDragging: true, isAirborne: true, vx: 0, vy: 0 });
  });

  ipcMain.on('drag:move', (_event, { dx, dy }) => {
    resetInactivity();
    if (!mainWindow || mainWindow.isDestroyed() || !dragOriginWinPos) return;
    const calcX = dragOriginWinPos[0] + dx;
    const calcY = dragOriginWinPos[1] + dy;
    const newX = Number.isFinite(calcX) ? Math.round(calcX) : dragOriginWinPos[0];
    const newY = Number.isFinite(calcY) ? Math.round(calcY) : dragOriginWinPos[1];
    mainWindow.setPosition(newX, newY);

    const now = Date.now();
    dragPositions.push({ time: now, pos: [newX, newY] });
    if (dragPositions.length > 6) dragPositions.shift();

    // Compute instantaneous velocity for tilt
    let vx = 0;
    let vy = 0;
    if (dragPositions.length >= 2) {
      const prev = dragPositions[0];
      const dt = Math.max(0.01, (now - prev.time) / 1000);
      const rawVx = (newX - prev.pos[0]) / dt;
      const rawVy = (newY - prev.pos[1]) / dt;
      if (Number.isFinite(rawVx)) vx = rawVx;
      if (Number.isFinite(rawVy)) vy = rawVy;
    }

    mainWindow.webContents.send('character:drag', { isDragging: true, isAirborne: true, vx, vy });
  });

  ipcMain.on('drag:end', () => {
    resetInactivity();
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const currentPos = mainWindow.getPosition();
    const workArea = screen.getPrimaryDisplay().workArea;
    const winSize = mainWindow.getSize();

    const floorY = Math.round(workArea.y + workArea.height - winSize[1]);
    const minY = Math.round(workArea.y);
    const minX = Math.round(workArea.x);
    const maxX = Math.round(workArea.x + workArea.width - winSize[0]);

    const startX = Number.isFinite(currentPos[0]) ? currentPos[0] : minX;
    const startY = Number.isFinite(currentPos[1]) ? currentPos[1] : floorY;

    // Compute throw release velocity from drag history
    let releaseVx = 0;
    let releaseVy = 0;
    const now = Date.now();
    if (dragPositions.length >= 2) {
      const oldest = dragPositions[0];
      const dt = (now - oldest.time) / 1000;
      if (dt > 0.005) {
        const calcVx = (startX - oldest.pos[0]) / dt;
        const calcVy = (startY - oldest.pos[1]) / dt;
        if (Number.isFinite(calcVx)) releaseVx = calcVx;
        if (Number.isFinite(calcVy)) releaseVy = calcVy;
      }
    }
    dragPositions = [];
    dragOriginWinPos = null;

    if (!physicsEngine) {
      physicsEngine = new PhysicsDropEngine();
    }

    mainWindow.webContents.send('character:drag', {
      isDragging: false,
      isAirborne: startY < floorY,
      vx: releaseVx,
      vy: releaseVy
    });

    // Launch gravity drop simulation with momentum and elastic bounce!
    physicsEngine.drop({
      startX,
      startY,
      vx: releaseVx,
      vy: releaseVy,
      floorY,
      bounds: { minX, maxX, minY },
      onStep: ({ x, y, vx, vy, isAirborne }) => {
        if (!mainWindow || mainWindow.isDestroyed()) return;
        const safeX = Number.isFinite(x) ? Math.round(x) : minX;
        const safeY = Number.isFinite(y) ? Math.round(y) : floorY;
        mainWindow.setPosition(safeX, safeY);
        mainWindow.webContents.send('character:physics', { x: safeX, y: safeY, vx, vy, isAirborne });
      },
      onBounce: ({ impactVelocity, type, final }) => {
        if (!mainWindow || mainWindow.isDestroyed()) return;
        mainWindow.webContents.send('character:land', { impactVelocity, type, final });
      },
      onRest: ({ x, y }) => {
        if (!mainWindow || mainWindow.isDestroyed()) return;
        const safeX = Number.isFinite(x) ? Math.round(x) : minX;
        const safeY = Number.isFinite(y) ? Math.round(y) : floorY;
        if (walker) {
          walker.setPosition(safeX, safeY);
          walker.resume('drag');
        }
      }
    });
  });

  // Click Interaction: jump reaction, wake up, and brief walker pause (APP-7, APP-8)
  ipcMain.on('interact:click', () => {
    resetInactivity();
    if (walker) {
      walker.pause('click');
      setTimeout(() => {
        if (walker) walker.resume('click');
      }, 750);
    }
  });

  // Settings IPC Handlers (APP-9, APP-14)
  ipcMain.handle('settings:get', () => {
    return currentSettings;
  });

  ipcMain.handle('settings:set', (_event, newSettings) => {
    currentSettings = settingsManager.save(newSettings);

    // Apply live changes
    if (walker) walker.speedPxPerSec = currentSettings.walkSpeedPxPerSec;
    if (sensorClient) {
      sensorClient.setHost(currentSettings.host, currentSettings.port);
      sensorClient.setPollInterval(currentSettings.pollIntervalMs);
    }
    resetInactivity();

    // Broadcast pet change and settings if updated
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('character:pet', currentSettings.selectedPet);
      mainWindow.webContents.send('settings:change', currentSettings);
    }

    // Re-evaluate current state with new thresholds
    if (lastReading) {
      handleSensorReading(lastReading);
    }
    return currentSettings;
  });

  // Simulation IPC handler (APP-12)
  ipcMain.on('sim:set', (_event, data) => {
    if (data.enabled === false) {
      isSimulationMode = false;
      if (sensorClient) {
        sensorClient.poll();
      }
      return;
    }

    isSimulationMode = true;
    simulationData = { ...simulationData, ...data };
    applySimulationReading();
  });

  mainWindow.on('closed', () => {
    if (sleepTimer) clearTimeout(sleepTimer);
    if (walker) walker.stop();
    if (sensorClient) sensorClient.stop();
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  initApp();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      initApp();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

module.exports = {
  getWalker: () => walker,
  getSensorClient: () => sensorClient,
  openSettingsWindow,
  resetInactivity
};
