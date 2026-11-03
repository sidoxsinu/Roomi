const { app, BrowserWindow, ipcMain, screen } = require('electron');
const { createCharacterWindow } = require('./window');
const { setupTray } = require('./tray');
const { Walker } = require('./walker');
const { SensorClient } = require('./sensorClient');
const { resolveState, DEFAULT_THRESHOLDS } = require('./reactionEngine');

let mainWindow = null;
let tray = null;
let walker = null;
let sensorClient = null;
let dragOriginWinPos = null;

// Settings & Thresholds
let thresholds = { ...DEFAULT_THRESHOLDS };

// Sleep Inactivity State Management (APP-8)
let sleepTimeoutMs = 5 * 60 * 1000; // Default 5 minutes
let sleepTimer = null;
let isSleeping = false;
let currentResolvedState = 'happy';
let stateTracker = { candidate: 'happy', count: 0 };
let lastReading = null;

function emitCharacterState(state, reasons = []) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('character:state', { state, reasons });
  }
}

function emitSensorUpdate(data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('sensor:update', data);
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

  sleepTimer = setTimeout(() => {
    // Sleep only applies when resolved state is happy per 06-CHARACTER-BEHAVIOUR.md
    if (currentResolvedState === 'happy' && !isSleeping) {
      isSleeping = true;
      if (walker) walker.pause('sleeping');
      emitCharacterState('sleeping');
    }
  }, sleepTimeoutMs);
}

function handleSensorReading(reading) {
  lastReading = reading;
  emitSensorUpdate(reading);

  const resolved = resolveState(
    {
      temperature: reading.temperature,
      humidity: reading.humidity,
      status: reading.sensor_status,
      connected: sensorClient ? sensorClient.isConnected : false
    },
    thresholds,
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
      walker.speedPxPerSec = 50; // Normal brisk pace
    }
  }
}

function handleSensorStatus({ connected, reason }) {
  emitSensorStatus({ connected, reason });

  if (!connected) {
    const resolved = resolveState(
      {
        temperature: null,
        humidity: null,
        status: 'error',
        connected: false
      },
      thresholds,
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

function initApp() {
  mainWindow = createCharacterWindow();

  // Setup system tray menu (APP-11)
  tray = setupTray(mainWindow);

  // Setup Walker moving the window (APP-2)
  walker = new Walker(mainWindow);
  walker.start();

  // Setup Sensor Client (APP-3, APP-4)
  // Use mock server port 8080 or roomi.local
  sensorClient = new SensorClient({
    host: process.env.ROOMI_HOST || 'localhost',
    port: parseInt(process.env.ROOMI_PORT || '8080', 10),
    pollIntervalMs: 3000
  });

  sensorClient.on('sensor:update', handleSensorReading);
  sensorClient.on('sensor:status', handleSensorStatus);
  sensorClient.start();

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

  // Manual Drag Interactions (APP-7)
  ipcMain.on('drag:start', () => {
    resetInactivity();
    if (!mainWindow || mainWindow.isDestroyed()) return;
    dragOriginWinPos = mainWindow.getPosition();
    if (walker) walker.pause('drag');
  });

  ipcMain.on('drag:move', (_event, { dx, dy }) => {
    resetInactivity();
    if (!mainWindow || mainWindow.isDestroyed() || !dragOriginWinPos) return;
    const newX = Math.round(dragOriginWinPos[0] + dx);
    const newY = Math.round(dragOriginWinPos[1] + dy);
    mainWindow.setPosition(newX, newY);
  });

  ipcMain.on('drag:end', () => {
    resetInactivity();
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const currentPos = mainWindow.getPosition();
    const workArea = screen.getPrimaryDisplay().workArea;
    const winSize = mainWindow.getSize();

    // Snap Y back to bottom of workArea per spec
    const snappedY = workArea.y + workArea.height - winSize[1];
    const minX = workArea.x;
    const maxX = workArea.x + workArea.width - winSize[0];
    const clampedX = Math.max(minX, Math.min(maxX, currentPos[0]));

    mainWindow.setPosition(clampedX, snappedY);
    if (walker) {
      walker.setPosition(clampedX, snappedY);
      walker.resume('drag');
    }
    dragOriginWinPos = null;
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
  resetInactivity
};
