const electron = require('electron');
const path = require('path');
const url = require('url');
const ipc = require('electron').ipcMain;
const { autoUpdater, CancellationToken } = require('electron-updater');
const log = require('electron-log');

const storage = require('./lib/storage');
const menuTemplate = require('./menuTemplate');
const packageJson = require('../package.json');

const {
  app, BrowserWindow, Menu, Tray, nativeImage, systemPreferences,
} = electron;

const { getSlackInstances, removeSlackInstance } = require('./handlers/slackInstances');
const { getConnections } = require('./handlers/connections');
const { setStatus, updateStatuses } = require('./handlers/status');
const { getWorkspaces } = require('./handlers/workspaces');
const { getConfigurations, saveConfiguration, removeConfiguration, clearConfigurations } = require('./handlers/configurations');
const { handleAuth } = require('./handlers/auth');
const { getAppConfigurations, setAppConfigurations } = require('./handlers/appConfigurations');
// const { crashReporter } = require('./handlers/crashReporter');

// crashReporter();

const protocol = packageJson.product.Protocol;

require('dotenv').config({
  path: path.join(__dirname, '/../.env'),
});

let mainWindow = null;
let tray = null;
let quit = false;
let computerRunning = true;
const timers = {
};
let config = {
};
let cancellationToken = null;
let saveWindowSettingsTimeout = null;

const cached = {
  configurations: null,
  connections: null,
  slackInstances: null,
};

/**
 * Set auto update.
 */
const setAutoUpdater = async () => {
  config = await getAppConfigurations();

  Object.keys(config.updates).forEach(key => {
    autoUpdater[key] = config.updates[key];
  });

  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'info';
};

/**
 * Hide dock if available.
 */
const hideDock = () => {
  if (app.dock) {
    app.dock.hide();
  }
};

/**
 * Show dock if available.
 */
const showDock = () => {
  if (app.dock) {
    app.dock.show();
  }
};

/**
 * Execute callback if computer is not sleeping/hibernating.
 * @param {function} callback - Function to callback.
 */
const ifComputerRunning = async callback => {
  if (computerRunning) {
    await callback();
  }
};

/**
 * Send ipc event if mainWindow is available.
 * @param {string} event - Event to send.
 * @param {function} callback - Callback function to execute.
 * @param {any} data - Data to send.
 */
const sendIfMainWindow = async (event, callback, data = null) => {
  const cachedEvent = event;
  const value = await callback(data);

  if (Object.prototype.hasOwnProperty.call(cached, cachedEvent)) {
    cached[cachedEvent] = value;
  }

  if (mainWindow) {
    try {
      mainWindow.webContents.send(event, value);
    } catch (error) {
      log.error('sendIfMainwindow', error);
    }
  }
};

/**
 * If callback value is cached, use it, either execute callback function
 * and send as ipc event to mainWindow.
 * @param {string} event - Event to send.
 * @param {function} callback - Callback function to execute.
 */
const ifCachedSend = async (event, callback) => {
  if (cached[event]) {
    sendIfMainWindow(event, () => cached[event]);
  } else {
    await sendIfMainWindow(event, callback);
  }
};

/**
 * Set timer.
 * @param {string} event - Event for the timer.
 * @param {function} callback - Callback function to execute.
 * @param {boolean} [runNow=true] - Whether to execute the callback on setTimer().
 */
const setTimer = async (event, callback, runNow = true) => {
  clearInterval(timers[event]);
  const timeout = (await getAppConfigurations()).timers[event];
  if (runNow && callback) {
    callback();
  }
  timers[event] = setInterval(callback, timeout * 1000);
};

/**
 * If computer not sleeping/hibernating, update status for all Slack instances.
 */
const updateStatusesFunction = async () => {
  try {
    await ifComputerRunning(updateStatuses);
    ifComputerRunning(() => sendIfMainWindow('slackInstances', getWorkspaces));
  } catch (error) {
    log.error('updateStatusesFunction', error);
  }
};

/**
 * Set all the timers.
 * @param {boolean} runNow - Whether to execute the callbacks immediatelly.
 */
const startTimers = async (runNow = true) => {
  setTimer('slackInstances', () => ifComputerRunning(() => sendIfMainWindow('slackInstances', getWorkspaces)), runNow);
  setTimer('connections', () => ifComputerRunning(() => sendIfMainWindow('connections', getConnections)), runNow);
  setTimer('updateStatus', updateStatusesFunction, runNow);
};

/**
 * Save window settings (position and size).
 */
const saveWindowSettings = () => {
  clearTimeout(saveWindowSettingsTimeout);
  saveWindowSettingsTimeout = setTimeout(async () => {
    const windowSettings = await storage.get('windowSettings');
    const position = mainWindow.getPosition();
    const size = mainWindow.getSize();

    await storage.set('windowSettings', {
      ...windowSettings,
      position,
      size,
    });
  }, 250);
};

/**
 * Handle quit event.
 * @param {event} event - Event.
 */
const handleQuit = event => {
  if (config.app.closeToTray && !quit) {
    event.preventDefault();

    if (mainWindow) {
      mainWindow.hide();
      hideDock();

      if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.closeDevTools();
      }
    }
  }
};

/**
 * Reset application configurations.
 */
const resetApp = async () => {
  mainWindow.close();
  mainWindow = null;
  await clearConfigurations();
  await sendIfMainWindow('configurations', getConfigurations);
  await sendIfMainWindow('slackInstances', getSlackInstances);
  Object.keys(cached).forEach(key => {
    cached[key] = null;
  });
  createWindow(); // eslint-disable-line no-use-before-define
};

/**
 * Get application icon.
 * @returns {path} iconPath
 */
const getIcon = () => (
  path.join(__dirname, (process.env.NODE_ENV === 'development' ? '../src/assets' : ''), 'icons', 'fill', 'icon_16x16.png')
);

if (process.platform === 'darwin') {
  systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', () => {
    tray.setImage(getIcon());
  });
}

startTimers();

const iconPath = getIcon();

if (process.defaultApp && process.argv.length >= 2) {
  app.setAsDefaultProtocolClient(protocol, process.execPath, [path.resolve(process.argv[1])]);
} else {
  app.setAsDefaultProtocolClient(protocol);
}

/**
 * Create mainWindow
 */
const createWindow = async () => {
  const windowSettings = await storage.get('windowSettings');

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

  if (process.env.NODE_ENV === 'development') {
    // mainWindow.webContents.openDevTools();
  }

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate(autoUpdater, resetApp)));

  mainWindow
    .once('ready-to-show', () => {
      if (!config.app.launchMinimised) {
        mainWindow.show();
        showDock();
      }
    })
    .on('move', saveWindowSettings)
    .on('resize', saveWindowSettings)
    .on('minimize', event => {
      event.preventDefault();
      mainWindow.hide();
    })
    .on('close', handleQuit)
    .on('closed', event => {
      event.preventDefault();
      mainWindow = null;
      hideDock();
      return false;
    });
};

/**
 * Create tray.
 */
const createTray = async () => {
  tray = new Tray(nativeImage.createFromPath(iconPath));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Open ${packageJson.productName}`,
      click: () => {
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
      },
    },
    {
      label: 'Quit',
      click: () => {
        quit = true;
        app.quit();
      },
    },
  ]);
  tray.setToolTip(packageJson.productName);
  tray.setContextMenu(contextMenu);
  tray.on('click', () => (mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()));
};

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app
    .on('second-instance', (event, commandLine) => {
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
  .on('ready', async () => {
    createTray();
    config = await getAppConfigurations();
    setAutoUpdater();

    createWindow();

    if (config.app.launchMinimised) {
      hideDock();
    }

    electron.powerMonitor
      .on('suspend', () => { computerRunning = false; })
      .on('resume', () => { computerRunning = true; });
  })
  .on('open-url', (event, uri) => {
    event.preventDefault();
    handleAuth(sendIfMainWindow, uri);
  })
  .on('window-all-closed', () => {
    hideDock();
  })
  .on('will-quit', handleQuit);

ipc
  .on('initialize', async () => {
    const appConfigurations = await getAppConfigurations();
    ifCachedSend('appConfigurations', () => appConfigurations);
    ifCachedSend('configurations', getConfigurations);
    ifCachedSend('connections', getConnections);
    ifCachedSend('slackInstances', getSlackInstances);
    if (appConfigurations.updates.checkUpdatesOnLaunch) {
      autoUpdater.checkForUpdates();
    }
  })
  .on('getConnections', async () => sendIfMainWindow('connections', getConnections))
  .on('removeSlackInstance', async (event, data) => sendIfMainWindow('slackInstances', removeSlackInstance, data))
  .on('getConfigurations', async () => sendIfMainWindow('configurations', getConfigurations))
  .on('saveConfiguration', async (event, data, updateNow = true) => {
    await sendIfMainWindow('configurations', saveConfiguration, data);
    if (updateNow) {
      await setTimer('updateStatus', updateStatusesFunction);
      await sendIfMainWindow('savedConfiguration', () => false);
    }
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
  .on('saveAppConfigurations', async (event, data) => {
    const appConfigurations = await setAppConfigurations(data.appConfigurations);
    if (data.property === 'timers') {
      await startTimers(false);
    }
    config = appConfigurations;
    setAutoUpdater();
    await sendIfMainWindow('appConfigurations', () => appConfigurations);
  })
  .on('checkUpdates', () => autoUpdater.checkForUpdates())
  .on('update', () => {
    sendIfMainWindow('update-progress', () => ({
      type: 'info',
      title: 'Downloading updates...',
      progress: {
        percent: 0,
      },
      cancel: 'Cancel',
      onCancel: 'cancelUpdate',
    }));

    cancellationToken = new CancellationToken();

    autoUpdater.downloadUpdate(cancellationToken);
  })
  .on('cancelUpdate', () => {
    cancellationToken.cancel();
    sendIfMainWindow('update-cancelled', () => ({
      type: 'error',
      title: 'Downloading cancelled',
      message: 'Downloading the update was cancelled',
      cancel: 'Close',
      confirm: 'Check updates',
      onConfirm: 'checkUpdates',
    }));
  })
  .on('installUpdate', () => {
    quit = true;
    autoUpdater.quitAndInstall();
  });

autoUpdater
  .on('checking-for-update', () => {
    // log.info('Checking for updates...');
    sendIfMainWindow('info', () => ({
      message: 'Checking for updates...',
    }));
  })
  .on('update-available', event => {
    // log.warn('Updates available.', event);
    sendIfMainWindow('update-notification', () => ({
      type: 'info',
      title: 'Update available',
      updates: {
        currentVersion: app.getVersion(),
        ...event,
      },
      cancel: 'Close',
      confirm: 'Download update',
      onConfirm: 'update',
    }));
  })
  .on('update-not-available', () => {
    sendIfMainWindow('success', () => ({
      message: 'Software is up-to-date.',
    }));
  })
  .on('error', (event, error) => {
    log.error(error);
    sendIfMainWindow('error', () => ({
      message: 'Error in auto-updater.',
      error,
    }));
  })
  .on('update-cancelled', () => {
    // log.error('update-cancelled', error);
  })
  .on('download-progress', progress => {
    sendIfMainWindow('update-progress', () => ({
      type: 'info',
      title: 'Downloading updates...',
      progress,
      cancel: 'Cancel',
      onCancel: 'cancelUpdate',
    }));
  })
  .on('update-downloaded', () => {
    sendIfMainWindow('update-downloaded', () => ({
      type: 'success',
      title: 'Update downloaded',
      message: 'To install the updates, please click the "Install and restart" button below.',
      confirm: 'Install and restart',
      cancel: 'Close',
      onConfirm: 'installUpdate',
    }));
  });

process
  .on('unhandledRejection', (reason, p) => {
    log.error('Unhandled Rejection at:', p, 'reason:', reason);
  })
  .on('uncaughtException', error => {
    log.error('uncaughtException', error);
  })
  .on('warning', warning => {
    log.warn(warning.name);
    log.warn(warning.message);
    log.warn(warning.stack);
  });
