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

const protocol = 'slothy';

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
  fetchWorkspaces,
  fetchWorkspacesInterval,
  getConfigurations,
  saveConfiguration,
  removeConfiguration,
  handleAuth,
} = require('./utils.js');

require('dotenv').config({ path: path.join(__dirname, '/../.env') });

fetchWorkspaces();

let mainWindow;
let tray = null;
let quit = false;

const cached = {
  configurations: null,
  connections: null,
  slackInstances: null,
};

autoUpdater.autoDownload = false;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

const { app, BrowserWindow, Menu, Tray, nativeImage } = electron;

const iconPath = path.join(__dirname, 'favicon.ico');

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
  const [width, height] = windowSettings.size || [900, 600];

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

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  getConnections();

  if (!tray) {
    tray = new Tray(nativeImage.createFromPath(iconPath));

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App', click: () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) {
              mainWindow.restore();
            }
            mainWindow.show();
            mainWindow.focus();
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
      }
    ]);
    tray.setToolTip(packageJson.productName);
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
  }

  app.dock.show();

  mainWindow
    .once('ready-to-show', () => {
      mainWindow.show();
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
      if (mainWindow) {
        mainWindow.hide();
        app.dock.hide();
      }

      mainWindow = null;

      return false;
    });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app
    .on('second-instance', (event, commandLine, workingDirectory) => {
      event.preventDefault();
      handleAuth(mainWindow, commandLine.slice(-1)[0]);
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();
      }
    })
    .on('ready', createWindow)
    .on('window-all-closed', () => {
      app.dock.hide();
    })
    .on('will-quit', event => {
      if (!quit) {
        event.preventDefault();
      }
      app.dock.hide();
    });
}

app
  .on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.restore();
      mainWindow.focus();
    }
  })
  .on('open-url', (event, uri) => {
    event.preventDefault();
    handleAuth(mainWindow, uri);
  });

const sendIfMainWindow = async (event, func, data = null) => {
  const functionName = event;
  cached[functionName] = await func(data);
  if (mainWindow) {
    try {
      mainWindow.webContents.send(event, cached[functionName]);
    } catch (error) {
      throw new Error(error);
    }
  }
}

ipc
  .on('initialize', async () => {
    if (mainWindow && cached.configurations && cached.connections && cached.slackInstances) {
      sendIfMainWindow('configurations', () => cached.configurations);
      sendIfMainWindow('connections', () => cached.connections);
      sendIfMainWindow('slackInstances', () => cached.slackInstances);
    } else {
      await sendIfMainWindow('configurations', getConfigurations);
      await sendIfMainWindow('connections', getConnections);
      await sendIfMainWindow('slackInstances', getSlackInstances);
    }
  })
  .on('getConnections', async (event, data) => sendIfMainWindow('connections', getConnections))
  .on('removeSlackInstance', async (event, data) => sendIfMainWindow('slackInstances', removeSlackInstance, data))
  .on('getConfigurations', async (event, data) => sendIfMainWindow('configurations', getConfigurations))
  .on('saveConfiguration', async (event, data) => sendIfMainWindow('configurations', saveConfiguration, data))
  .on('removeConfiguration', async (event, data) => sendIfMainWindow('configurations', removeConfiguration, data))
  .on('setStatus', async (event, data) => {
    await setStatus(data);
    sendIfMainWindow('slackInstances', getSlackInstances);
  })
  .on('checkUpdates', () => {
    if (mainWindow) {
      autoUpdater.checkForUpdates();
    }
  })
  .on('update', () => {
    if (mainWindow) {
      mainWindow.webContents.send('info', 'Downloading updates...');
    }
    autoUpdater.downloadUpdate();
  })
  .on('installUpdate', () => {
    autoUpdater.quitAndInstall();
  });


setInterval(async () => {
  cached.slackInstances = await fetchWorkspaces();
  if (mainWindow) {
    mainWindow.webContents.send('slackInstances', cached.slackInstances);
  }
}, fetchWorkspacesInterval * 60 * 1000);
