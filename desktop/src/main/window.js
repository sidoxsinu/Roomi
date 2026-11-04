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

  const isMac = process.platform === 'darwin';

  const applyAlwaysOnTop = () => {
    if (win.isDestroyed()) return;
    if (isMac) {
      win.setAlwaysOnTop(true, 'screen-saver');
      win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      if (typeof win.moveTop === 'function') win.moveTop();
    } else {
      win.setAlwaysOnTop(true);
    }
  };

  applyAlwaysOnTop();
  win.on('show', applyAlwaysOnTop);
  win.on('blur', applyAlwaysOnTop);

  win.once('ready-to-show', () => {
    applyAlwaysOnTop();
    win.showInactive();
  });

  if (isMac && app.dock) {
    app.dock.hide();
  }

  // Click-through: ignore mouse events on transparent area, forward events to underlying apps
  win.setIgnoreMouseEvents(true, { forward: true });

  win.loadFile(path.join(__dirname, '../renderer/index.html'));

  return win;
}

module.exports = { createCharacterWindow };
