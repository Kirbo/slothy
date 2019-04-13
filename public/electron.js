const electron = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const os = require('os');
const ipc = require('electron').ipcMain;
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

const packageJson = require('../package.json');

const protocol = 'sloth2';

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


const createWindow = () => {
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

  mainWindow = new BrowserWindow({
    width: 800,
    minWidth: 600,
    height: 600,
    minHeight: 300,
    icon: iconPath,
    autoHideMenuBar: true,
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

  tray = new Tray(nativeImage.createFromPath(iconPath));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App', click: function () {
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
      label: 'Quit', click: function () {
        app.quit();
      }
    }
  ]);
  tray.setToolTip(packageJson.productName);
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  mainWindow
    .on('show', () => {
      tray.setHighlightMode('always');
    })
    .on('hide', () => {
      tray.setHighlightMode('never');
    })
    .on('minimize', event => {
      event.preventDefault();
      mainWindow.hide();
    })
    .on('close', event => {
      if (mainWindow) {
        mainWindow.hide();
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
      if (process.platform !== 'darwin') {
        app.quit();
      }
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
  if (mainWindow) {
    mainWindow.webContents.send(event, await func(data));
  }
}

ipc
  .on('initialize', () => (
    Promise
      .all([
        getConfigurations(),
        getConnections(),
        getSlackInstances(),
      ])
      .then(([configurations, connections, slackInstances]) => {
        if (mainWindow) {
          mainWindow.webContents.send('configurations', configurations);
          mainWindow.webContents.send('connections', connections);
          mainWindow.webContents.send('slackInstances', slackInstances);
        }
      })
  ))
  .on('getConnections', async (event, data) => sendIfMainWindow('connections', getConnections))
  .on('removeSlackInstance', async (event, data) => sendIfMainWindow('slackInstances', removeSlackInstance, data))
  .on('getConfigurations', async (event, data) => sendIfMainWindow('configurations', getConfigurations))
  .on('saveConfiguration', async (event, data) => sendIfMainWindow('configurations', saveConfiguration, data))
  .on('removeConfiguration', async (event, data) => sendIfMainWindow('configurations', removeConfiguration, data))
  .on('setStatus', async (event, data) => {
    if (mainWindow) {
      await setStatus(data);
      const slackInstances = await getSlackInstances();
      mainWindow.webContents.send('slackInstances', slackInstances);
    }
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
  if (mainWindow) {
    mainWindow.webContents.send('slackInstances', await fetchWorkspaces());
  }
}, fetchWorkspacesInterval * 60 * 1000);
