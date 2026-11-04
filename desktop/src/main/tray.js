const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');

let tray = null;

function setupTray(mainWindow, options = {}) {
  const iconPath = path.join(__dirname, '../../assets/tray.png');
  const icon = nativeImage.createFromPath(iconPath);

  tray = new Tray(icon);
  tray.setToolTip('ROOMI - Desktop Pet');

  function bringWindowToTop() {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.showInactive();
    if (process.platform === 'darwin') {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
      if (typeof mainWindow.moveTop === 'function') mainWindow.moveTop();
    } else {
      mainWindow.setAlwaysOnTop(true);
    }
  }

  function updateMenu() {
    const isVisible = mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible();

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show ROOMI',
        click: () => {
          bringWindowToTop();
          updateMenu();
        }
      },
      {
        label: 'Settings...',
        click: () => {
          if (options.onOpenSettings) {
            options.onOpenSettings();
          }
        }
      },
      {
        label: options.isSimulation ? 'Simulation Mode: ON' : 'Simulation Mode: OFF',
        click: () => {
          if (options.onToggleSimulation) {
            options.onToggleSimulation();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Quit ROOMI',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
  }

  tray.on('click', () => {
    bringWindowToTop();
    updateMenu();
  });

  updateMenu();
  return tray;
}

module.exports = { setupTray };
