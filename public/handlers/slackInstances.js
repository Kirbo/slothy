const storage = require('../lib/storage');

const { getWorkspace, getWorkspaceEmojis } = require('./workspaces');

const getSlackInstances = async () => (
  new Promise(async (resolve, reject) => {
    try {
      const data = await storage.get('slackInstances');
      let instances = [];
      if (data.length) {
        instances = data;
      }
      resolve(instances);
    } catch (error) {
      reject(error);
    }
  })
);

const updateSlackInstance = async ({ instance, profile }) => (
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
      reject(error);
    }
  })
);

const saveSlackInstance = async (instance) => (
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
      reject(error);
    }
  })
);

const removeSlackInstance = async ({ token }) => (
  new Promise(async (resolve, reject) => {
    try {
      resolve(await storage.set('slackInstances', (await getSlackInstances()).filter(instance => instance.token !== token)));
    } catch (error) {
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
