const electron = require('electron');

const packageJson = require('../package.json');

const { shell } = electron;

/**
 * Populate application menu
 * @param {object} autoUpdater - autoUpdater object.
 * @param {function} resetApp - resetApp function.
 * @returns {array} menuTemplate
 */
const menuTemplate = (autoUpdater, resetApp) => {
  const MENU_TEMPLATE = [
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          selector: 'undo:',
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          selector: 'redo:',
        },
        {
          type: 'separator',
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          selector: 'cut:',
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          selector: 'copy:',
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          selector: 'paste:',
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:',
        },
      ],
    },
    {
      role: 'window',
      submenu: [
        {
          role: 'zoomIn',
        },
        {
          role: 'zoomOut',
        },
        {
          role: 'resetZoom',
        },
        {
          type: 'separator',
        },
        {
          role: 'reload',
        },
        {
          role: 'forcereload',
        },
        {
          type: 'separator',
        },
        {
          role: 'close',
        },
        {
          role: 'minimize',
        },
      ],
    },
  ];


  if (process.platform === 'darwin') {
    // Window menu
    MENU_TEMPLATE[1].submenu = [
      {
        role: 'zoomIn',
      },
      {
        role: 'zoomOut',
      },
      {
        role: 'resetZoom',
      },
      {
        type: 'separator',
      },
      {
        role: 'reload',
      },
      {
        role: 'forcereload',
      },
      {
        type: 'separator',
      },
      {
        role: 'close',
      },
      {
        role: 'minimize',
      },
      {
        role: 'zoom',
      },
      {
        type: 'separator',
      },
      {
        role: 'front',
      },
    ];

    MENU_TEMPLATE.unshift({
      label: packageJson.productName,
      submenu: [
        {
          role: 'about',
        },
        {
          type: 'separator',
        },
        {
          label: 'Check for updates',
          click: () => { autoUpdater.checkForUpdates(); },
        },
        {
          role: 'services',
          submenu: [],
        },
        {
          type: 'separator',
        },
        {
          role: 'hide',
        },
        {
          role: 'hideothers',
        },
        {
          role: 'unhide',
        },
        {
          type: 'separator',
        },
        {
          role: 'quit',
        },
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
      {
        type: 'separator',
      },
      {
        role: 'toggleDevTools',
      },
      {
        label: 'Reset app',
        click: async () => resetApp(),
      },
    ],
  });

  return MENU_TEMPLATE;
};

module.exports = menuTemplate;
