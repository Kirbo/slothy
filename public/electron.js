const electron = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const os = require('os');
const ipc = require('electron').ipcMain;
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const request = require('request');

const {
  getSlackInstances,
  // updateSlackInstance,
  saveSlackInstance,
  removeSlackInstance,
  getStatus,
  // getWorkspace,
  getConnections,
  setStatus,
  getParameterByName,
  fetchWorkspaces,
  fetchWorkspacesInterval,
} = require('./utils.js');

require('dotenv').config({ path: path.join(__dirname, '/../.env') });

let mainWindow;

autoUpdater.autoDownload = false;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('sloth2', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('sloth2')
}

const handleAuth = (uri) => {
  const { hostname } = url.parse(uri);

  if (hostname === 'auth') {
    const code = getParameterByName(uri, 'code');
    const options = {
      uri: `https://slack.com/api/oauth.access?code=${code}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=sloth2://auth`,
      method: 'GET',
    };

    request(options, async (error, response, body) => {
      const { ok, access_token } = JSON.parse(body);
      if (!ok) {
        mainWindow.webContents.send('error', 'Error in authentication!');
      } else {
        const profile = await getStatus({ token: access_token });
        let instance;

        if (profile) {
          instance = await saveSlackInstance({
            token: access_token,
            profile,
          });
        }
        mainWindow.webContents.send('slackInstances', await getSlackInstances());
        mainWindow.webContents.send('newSlackInsatance', instance);
      }
    });
  }
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

  mainWindow = new BrowserWindow({ width: 800, height: 600 });

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

  mainWindow.on('closed', () => {
    mainWindow = null;
  })
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    event.preventDefault();
    handleAuth(commandLine[2]);
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  })

  app.on('ready', createWindow);
}

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('open-url', (event, uri) => {
  event.preventDefault();
  handleAuth(uri);
});

setInterval(async () => {
  const slackInstances = await fetchWorkspaces();
  mainWindow.webContents.send('slackInstances', slackInstances);
}, fetchWorkspacesInterval * 60 * 1000);

ipc
  .on('initialize', () => (
    Promise
      .all([
        getConnections(),
        getSlackInstances(),
      ])
      .then(([connections, slackInstances]) => {
        if (mainWindow) {
          mainWindow.webContents.send('connections', connections);
          mainWindow.webContents.send('slackInstances', slackInstances);
        }
      })
  ))
  .on('getConnections', async () => {
    if (mainWindow) {
      mainWindow.webContents.send('connections', await getConnections());
    }
  })
  .on('removeSlackInstance', async (event, data) => {
    if (mainWindow) {
      mainWindow.webContents.send('slackInstances', await removeSlackInstance(data));
    }
  })
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
  })
;
