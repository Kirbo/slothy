const storage = require('../lib/storage');
const appConfigs = require('../lib/config');

const { mergeDeep, recursiveObject } = require('../lib/utils');

const getAppConfigurations = async () => (
  new Promise(async (resolve, reject) => {
    try {
      resolve(recursiveObject(appConfigs, mergeDeep(appConfigs, await storage.get('appConfigs'))));
    } catch (error) {
      reject(error);
    }
  })
)

const setAppConfigurations = async appConfigurations => (
  new Promise(async (resolve, reject) => {
    try {
      resolve(await storage.set('appConfigs', recursiveObject(appConfigs, appConfigurations)));
    } catch (error) {
      reject(error);
    }
  })
)

module.exports = {
  getAppConfigurations,
  setAppConfigurations,
};
