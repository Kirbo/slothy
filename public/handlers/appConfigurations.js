const log = require('electron-log');

const storage = require('../lib/storage');
const appConfigs = require('../lib/config');
const { mergeDeep, recursiveObject } = require('../lib/utils');

/**
 * Get application configurations.
 * @returns {object} appConfigurations
 */
const getAppConfigurations = () => (
  new Promise(async (resolve, reject) => {
    try {
      resolve(recursiveObject(appConfigs, mergeDeep(appConfigs, await storage.get('appConfigs'))));
    } catch (error) {
      log.error('getAppConfigurations', error);
      reject(error);
    }
  })
);

/**
 * Save application configurations.
 * @param {object} appConfigurations - Application configurations to save.
 * @returns {object} appConfigurations
 */
const setAppConfigurations = appConfigurations => (
  new Promise(async (resolve, reject) => {
    try {
      resolve(await storage.set('appConfigs', recursiveObject(appConfigs, appConfigurations)));
    } catch (error) {
      log.error('setAppConfigurations', error);
      reject(error);
    }
  })
);

module.exports = {
  getAppConfigurations,
  setAppConfigurations,
};
