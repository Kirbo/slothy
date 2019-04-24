const log = require('electron-log');

const storage = require('../lib/storage');
const appConfigs = require('../lib/config');
const { mergeDeep, recursiveObject } = require('../lib/utils');

const getAppConfigurations = () => (
  new Promise(async (resolve, reject) => {
    try {
      resolve(recursiveObject(appConfigs, mergeDeep(appConfigs, await storage.get('appConfigs'))));
    } catch (error) {
      log.error('getAppConfigurations', error);
      reject(error);
    }
  })
)

const setAppConfigurations = appConfigurations => (
  new Promise(async (resolve, reject) => {
    try {
      resolve(await storage.set('appConfigs', recursiveObject(appConfigs, appConfigurations)));
    } catch (error) {
      log.error('setAppConfigurations', error);
      reject(error);
    }
  })
)

module.exports = {
  getAppConfigurations,
  setAppConfigurations,
};
