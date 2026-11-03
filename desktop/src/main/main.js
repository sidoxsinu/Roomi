const { app, BrowserWindow, ipcMain, screen } = require('electron');
const { createCharacterWindow } = require('./window');
const { setupTray } = require('./tray');
const { Walker } = require('./walker');

let mainWindow = null;
let tray = null;
let walker = null;
let dragOriginWinPos = null;

// Sleep Inactivity State Management (APP-8)
let sleepTimeoutMs = 5 * 60 * 1000; // Default 5 minutes
let sleepTimer = null;
let isSleeping = false;
let currentResolvedState = 'happy';

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

function emitCharacterState(state, reasons = []) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('character:state', { state, reasons });
  }
}

function setSleepTimeoutMinutes(minutes) {
  sleepTimeoutMs = Math.max(1, minutes) * 60 * 1000;
  resetInactivity();
}

function initApp() {
  mainWindow = createCharacterWindow();

  // Setup system tray menu (APP-11)
  tray = setupTray(mainWindow);

  // Setup Walker moving the window (APP-2)
  walker = new Walker(mainWindow);
  walker.start();

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
  setSleepTimeoutMinutes,
  triggerSleepForTesting: () => {
    if (currentResolvedState === 'happy') {
      isSleeping = true;
      if (walker) walker.pause('sleeping');
      emitCharacterState('sleeping');
    }
  },
  resetInactivity
};
