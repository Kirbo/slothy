const log = require('electron-log');

const storage = require('../lib/storage');

const getSlackInstances = () => (
  new Promise(async (resolve, reject) => {
    try {
      const data = await storage.get('slackInstances');
      let instances = [];
      if (data.length) {
        instances = data;
      }
      resolve(instances);
    } catch (error) {
      log.error('getSlackInstances', error);
      reject(error);
    }
  })
);

const updateSlackInstance = ({ instance, profile }) => (
  new Promise(async (resolve, reject) => {
    try {
      const slackInstances = await getSlackInstances();

      const newSlackInstances = [
        ...slackInstances.filter(i => i.token !== instance.token),
        {
          ...instance,
          profile,
        }
      ];

      resolve(await storage.set('slackInstances', newSlackInstances));
    } catch (error) {
      log.error('updateSlackInstance', error);
      reject(error);
    }
  })
);

const saveSlackInstance = (instance) => (
  new Promise(async (resolve, reject) => {
    try {
      const token = { token: instance.token };
      const workspace = await getWorkspace(token);
      const newInstance = {
        ...instance,
        ...workspace,
        enabled: false,
        emojis: await getWorkspaceEmojis(token),
        token: instance.token,
        configs: [],
      };

      const slackInstances = await getSlackInstances();
      await storage.set('slackInstances', [...slackInstances, newInstance]);
      resolve(newInstance);
    } catch (error) {
      log.error('saveSlackInstance', error);
      reject(error);
    }
  })
);

const removeSlackInstance = ({ token }) => (
  new Promise(async (resolve, reject) => {
    try {
      resolve(await storage.set('slackInstances', (await getSlackInstances()).filter(instance => instance.token !== token)));
    } catch (error) {
      log.error('removeSlackInstance', error);
      reject(error);
    }
  })
);

module.exports = {
  getSlackInstances,
  updateSlackInstance,
  saveSlackInstance,
  removeSlackInstance,
};

const { getWorkspace, getWorkspaceEmojis } = require('./workspaces');
