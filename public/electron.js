const electron = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const os = require('os');
const ipc = require('electron').ipcMain;
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const storage = require('electron-json-storage');

const packageJson = require('../package.json');

const protocol = packageJson.product.Protocol;

const { app, BrowserWindow, Menu, Tray, nativeImage, systemPreferences, shell } = electron;

const getIcon = () => (
  path.join(__dirname, (process.env.NODE_ENV === 'development' ? '../src/assets' : ''), 'icons', 'fill', 'icon_16x16.png')
)

if (process.platform === 'darwin') {
  systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', () => {
    tray.setImage(getIcon());
  });
}

const {
  getSlackInstances,
  // updateSlackInstance,
  // saveSlackInstance,
  removeSlackInstance,
  // getStatus,
  // getWorkspace,
  getConnections,
  setStatus,
  // getParameterByName,
  getWorkspaces,
  getConfigurations,
  saveConfiguration,
  removeConfiguration,
  clearConfigurations,
  handleAuth,
  getAppConfigs,
  updateStatuses,
} = require('./utils.js');

require('dotenv').config({ path: path.join(__dirname, '/../.env') });

let mainWindow;
let tray = null;
let quit = false;
let computerRunning = true;
let timers = {};

const cached = {
  configurations: null,
  connections: null,
  slackInstances: null,
};

autoUpdater.autoDownload = false;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';


const hideDock = () => {
  if (app.dock) {
    app.dock.hide();
  }
}

const showDock = () => {
  if (app.dock) {
    app.dock.show();
  }
}

const ifComputerRunning = async callback => {
  if (computerRunning) {
    await callback();
  }
}

const sendIfMainWindow = async (event, callback, data = null) => {
  const cachedEvent = event;
  const value = await callback(data);

  if (cached.hasOwnProperty(cachedEvent)) {
    cached[cachedEvent] = value;
  }

  if (mainWindow) {
    try {
      mainWindow.webContents.send(event, value);
    } catch (error) {
      throw new Error(error);
    }
  }
}

const ifCachedSend = async (event, callback) => {
  if (cached[event]) {
    sendIfMainWindow(event, () => cached[event]);
  } else {
    await sendIfMainWindow(event, callback);
  }
}

const setTimer = async (event, callback) => {
  clearInterval(timers[event]);
  const timeout = (await getAppConfigs()).timers[event];
  callback();
  timers[event] = setInterval(callback, timeout * 1000);
}

const updateStatusesFunction = async () => {
  await ifComputerRunning(updateStatuses);
  ifComputerRunning(() => sendIfMainWindow('slackInstances', getWorkspaces));
}

const startTimers = async () => {
  setTimer('slackInstances', () => ifComputerRunning(() => sendIfMainWindow('slackInstances', getWorkspaces)));
  setTimer('connections', () => ifComputerRunning(() => sendIfMainWindow('connections', getConnections)));
  setTimer('updateStatus', updateStatusesFunction);
}

startTimers();

const iconPath = getIcon();

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(protocol, process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient(protocol);
}

const createWindow = async () => {
  if (process.env.NODE_ENV === 'development' && !BrowserWindow.getDevToolsExtensions().hasOwnProperty('React Developer Tools')) {
    let extensionPath;
    if (process.platform === 'darwin') {
      const baseDir = path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi');
      const folder = fs.readdirSync(baseDir)[0];
      extensionPath = path.join(baseDir, folder);
    }

    if (extensionPath) {
      BrowserWindow.addDevToolsExtension(extensionPath);
    }
  }

  const windowSettings = await new Promise((resolve, reject) => {
    storage.get('windowSettings', (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  });
  const [x, y] = windowSettings.position || [null, null];
  const [width, height] = windowSettings.size || [950, 600];

  mainWindow = new BrowserWindow({
    minWidth: 600,
    minHeight: 300,
    icon: iconPath,
    autoHideMenuBar: true,
    show: false,
    title: packageJson.productName,
    width,
    height,
    x,
    y,
  });

  let startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(startUrl);
  showDock();

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  const MENU_TEMPLATE = [
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
      ],
    },
    {
      role: 'window',
      submenu: [
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forcereload' },
        { type: 'separator' },
        { role: 'close' },
        { role: 'minimize' },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    // Window menu
    MENU_TEMPLATE[1].submenu = [
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { role: 'resetZoom' },
      { type: 'separator' },
      { role: 'reload' },
      { role: 'forcereload' },
      { type: 'separator' },
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' },
    ];
  }

  if (process.platform === 'darwin') {
    MENU_TEMPLATE.unshift({
      label: packageJson.productName,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Check for updates',
          click() { autoUpdater.checkForUpdates(); },
        },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  MENU_TEMPLATE.push({
    role: 'help',
    submenu: [
      {
        label: 'Check for updates',
        click: () => { autoUpdater.checkForUpdates(); },
      },
      {
        label: 'Official website',
        click: () => { shell.openExternal(packageJson.product.Pages); },
      },
      {
        label: 'Join Slothy Slack',
        click: () => { shell.openExternal(packageJson.product.Slack); },
      },
      { type: 'separator' },
      { role: 'toggleDevTools' },
      {
        label: 'Reset app',
        click: async () => {
          mainWindow.close();
          mainWindow = null;
          await sendIfMainWindow('configurations', clearConfigurations);
          Object.keys(cached).forEach(key => {
            cached[key] = null;
          });
          createWindow();
        },
      },
    ],
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate(MENU_TEMPLATE));

  if (!tray) {
    tray = new Tray(nativeImage.createFromPath(iconPath));

    const contextMenu = Menu.buildFromTemplate([
      {
        label: `Open ${packageJson.productName}`, click: () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) {
              mainWindow.restore();
            }
            mainWindow.show();
            mainWindow.focus();
            showDock();
          } else {
            createWindow();
          }
        }
      },
      {
        label: 'Quit', click: () => {
          quit = true;
          app.quit();
        }
      },
    ]);
    tray.setToolTip(packageJson.productName);
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
  }

  mainWindow
    .once('ready-to-show', () => {
      mainWindow.show();
      showDock();
    })
    .on('move', () => {
      storage.get('windowSettings', (error, data) => {
        const position = mainWindow.getPosition();

        storage.set('windowSettings', {
          ...data,
          position,
        });
      });
    })
    .on('resize', () => {
      storage.get('windowSettings', (error, data) => {
        const size = mainWindow.getSize();

        storage.set('windowSettings', {
          ...data,
          size,
        });
      });
    })
    .on('minimize', event => {
      event.preventDefault();
      mainWindow.hide();
    })
    .on('close', event => {
      if (!quit) {
        event.preventDefault();
      }
      if (mainWindow) {
        mainWindow.hide();
        hideDock();

        if (process.env.NODE_ENV === 'development') {
          mainWindow.webContents.closeDevTools();
        }
      }
    })
    .on('closed', event => {
      event.preventDefault();
      mainWindow = null;
      hideDock();
      return false;
    });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app
    .on('second-instance', (event, commandLine, workingDirectory) => {
      event.preventDefault();
      handleAuth(sendIfMainWindow, commandLine.slice(-1)[0]);
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();
        showDock();
      } else {
        createWindow();
      }
    });
}

app
  .on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    } else {
      showDock();
      mainWindow.show();
      mainWindow.focus();
    }
  })
  .on('ready', () => {
    createWindow();
    showDock();
    electron.powerMonitor
      .on('suspend', () => computerRunning = false)
      .on('resume', () => computerRunning = true);
  })
  .on('open-url', (event, uri) => {
    event.preventDefault();
    handleAuth(sendIfMainWindow, uri);
  })
  .on('window-all-closed', () => {
    hideDock();
  })
  .on('will-quit', event => {
    if (!quit) {
      event.preventDefault();

      if (mainWindow) {
        mainWindow.hide();
        hideDock();

        if (process.env.NODE_ENV === 'development') {
          mainWindow.webContents.closeDevTools();
        }

        mainWindow = null;
        return false;
      }
    }
  });


ipc
  .on('initialize', async () => {
    ifCachedSend('configurations', getConfigurations);
    ifCachedSend('connections', getConnections);
    ifCachedSend('slackInstances', getSlackInstances);
  })
  .on('getConnections', async (event, data) => sendIfMainWindow('connections', getConnections))
  .on('removeSlackInstance', async (event, data) => sendIfMainWindow('slackInstances', removeSlackInstance, data))
  .on('getConfigurations', async (event, data) => sendIfMainWindow('configurations', getConfigurations))
  .on('saveConfiguration', async (event, data) => {
    await sendIfMainWindow('configurations', saveConfiguration, data);
    await setTimer('updateStatus', updateStatusesFunction);
    await sendIfMainWindow('savedConfiguration', () => false);
  })
  .on('removeConfiguration', async (event, data) => {
    await sendIfMainWindow('configurations', removeConfiguration, data);
    await setTimer('updateStatus', updateStatusesFunction);
    await sendIfMainWindow('removedConfiguration', () => false);
  })
  .on('setStatus', async (event, data) => {
    await setStatus(data);
    sendIfMainWindow('slackInstances', getSlackInstances);
  })
  .on('checkUpdates', autoUpdater.checkForUpdates)
  .on('update', autoUpdater.downloadUpdate)
  .on('installUpdate', autoUpdater.quitAndInstall);

autoUpdater
  .on('checking-for-update', () => {
    sendIfMainWindow('info', () => 'Checking for updates...');
  })
  .on('update-available', event => {
    log.warn('Updates available.', event);
    const message = `
      <table class="updates">
        <tr>
          <th>Current version</th>
          <td>${electron.getVersion()}</td>
        </tr>
        <tr>
          <th>Latest version</th>
          <td>${event.version}</td>
        </tr>
      </table>
      <h4>Release date</h4>
      ${new Date(event.releaseDate)}
      <br />
      <br />
      <h4>Release notes</h4>
      <div class="release-notes">
        ${event.releaseNotes}
      </div>
    `;
    sendIfMainWindow('warning', () => ({ title: 'Update available', message, button: 'update' }));
  })
  .on('update-not-available', () => {
    sendIfMainWindow('success', () => 'Software is up-to-date.');
  })
  .on('error', (event, error) => {
    log.error(error);
    sendIfMainWindow('error', () => 'Error in auto-updater.');
  })
  .on('download-progress', () => {
    sendIfMainWindow('info', () => 'Downloading updates...');
  })
  .on('update-downloaded', () => {
    sendIfMainWindow('success', () => ({ title: 'Update downloaded', message: 'Please restart the app to finish the update', button: 'install' }));
  });
