module.exports = {
  // Timers are in seconds
  timers: {
    updateStatus: 300,
    connections: 60,
    slackInstances: 900,
  },
  updates: {
    autoDownload: false,
    autoInstallOnAppQuit: true,
    allowPrerelease: false,
    allowDowngrade: false,
    fullChangelog: false,

    checkUpdatesOnLaunch: true,
  },
  app: {
    closeToTray: true,
    launchMinimised: false,
  },
};
