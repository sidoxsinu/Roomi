const { BrowserWindow, app } = require('electron');
const path = require('path');

function createCharacterWindow() {
  const win = new BrowserWindow({
    width: 200,
    height: 220,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: '#00000000', // Ensures transparency without black background glitches on Windows
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  const keepOnTop = () => {
    if (!win.isDestroyed()) {
      win.setAlwaysOnTop(true, 'screen-saver');
      win.moveTop();
    }
  };
  const topmostTimer = setInterval(keepOnTop, 1000);
  win.on('show', keepOnTop);
  win.on('blur', keepOnTop);
  win.on('closed', () => clearInterval(topmostTimer));
  win.once('ready-to-show', () => {
    keepOnTop();
    win.showInactive();
  });

  if (process.platform === 'darwin') {
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    if (app.dock) {
      app.dock.hide();
    }
  }

  // Click-through: ignore mouse events on transparent area, forward events to underlying apps
  win.setIgnoreMouseEvents(true, { forward: true });

  win.loadFile(path.join(__dirname, '../renderer/index.html'));

  return win;
}

module.exports = { createCharacterWindow };
