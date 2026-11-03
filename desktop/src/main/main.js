const { app, BrowserWindow, ipcMain } = require('electron');
const { createCharacterWindow } = require('./window');
const { setupTray } = require('./tray');
const { Walker } = require('./walker');

let mainWindow = null;
let tray = null;
let walker = null;

function initApp() {
  mainWindow = createCharacterWindow();

  // Setup system tray menu (APP-11)
  tray = setupTray(mainWindow);

  // Setup Walker moving the window (APP-2)
  walker = new Walker(mainWindow);
  walker.start();

  // IPC listener for hover-based click-through (APP-10)
  ipcMain.on('hover:set', (_event, isHovering) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (isHovering) {
        mainWindow.setIgnoreMouseEvents(false);
      } else {
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
      }
    }
  });

  mainWindow.on('closed', () => {
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

module.exports = { getWalker: () => walker };
