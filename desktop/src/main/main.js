const { app, BrowserWindow, ipcMain } = require('electron');
const { createCharacterWindow } = require('./window');

let mainWindow = null;

function initApp() {
  mainWindow = createCharacterWindow();

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
