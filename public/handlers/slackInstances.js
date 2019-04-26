/* eslint-disable no-use-before-define */
const log = require('electron-log');

const storage = require('../lib/storage');

/**
 * Get stored Slack instances.
 * @returns {array} slackInstances
 */
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

/**
 * Update Slack instance in store.
 * @param {object} slackInstance - Slack instance to update in store.
 * @returns {array} slackInstances
 */
const updateSlackInstance = ({ instance, profile }) => (
  new Promise(async (resolve, reject) => {
    try {
      const slackInstances = await getSlackInstances();

      const newSlackInstances = [
        ...slackInstances.filter(i => i.token !== instance.token),
        {
          ...instance,
          profile,
        },
      ];

      resolve(await storage.set('slackInstances', newSlackInstances));
    } catch (error) {
      log.error('updateSlackInstance', error);
      reject(error);
    }
  })
);

/**
 * Save Slack instance into store.
 * @param {Object} instance - Slack instance to store.
 * @returns {array} slackInstances
 */
const saveSlackInstance = instance => (
  new Promise(async (resolve, reject) => {
    try {
      const token = {
        token: instance.token,
      };
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

/**
 * Remove stored Slack instance.
 * @param {object} slackInstance - Slack instance to remove.
 * @returns {array} slackInstances
 */
const removeSlackInstance = ({ id, token }) => (
  new Promise(async (resolve, reject) => {
    try {
      const slackInstances = await getSlackInstances();
      await storage.set('configurations', (await getConfigurations()).filter(({ instanceId }) => instanceId !== id));
      const filteredSlackInstances = slackInstances.filter(instance => instance.token !== token);
      resolve(await storage.set('slackInstances', filteredSlackInstances));
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

const { getConfigurations } = require('./configurations');
const { getWorkspace, getWorkspaceEmojis } = require('./workspaces');
