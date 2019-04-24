const storage = require('../lib/storage');
const log = require('electron-log');

const { getCurrentConnections } = require('./connections');
const { getSlackInstances } = require('./slackInstances');

const getConfigurations = async () => (
  new Promise(async (resolve, reject) => {
    try {
      const data = await storage.get('configurations');
      let configurations = [];
      if (data.length) {
        configurations = data;
      }
      resolve(configurations);
    } catch (error) {
      reject(error);
    }
  })
);

const getEnabledConfigurations = async () => (
  new Promise(async (resolve, reject) => {
    try {
      const promises = [
        (await getConfigurations()).filter(({ enabled }) => !!enabled),
        await getCurrentConnections(),
        await getSlackInstances(),
      ];

      Promise
        .all(promises)
        .then(([enabledConfigurations, currentConnections, slackInstances]) => {
          const connectedBssids = currentConnections.map(({ bssid }) => bssid.toUpperCase());
          const bssidConfigurations = enabledConfigurations.filter(({ bssid }) => bssid && connectedBssids.includes(bssid.toUpperCase()));

          const connectedSsids = currentConnections.map(({ ssid }) => ssid.toUpperCase());
          const ssidConfigurations = enabledConfigurations.filter(({ bssid, instanceId, ssid }) => {
            if (bssid && connectedBssids.includes(bssid.toUpperCase()) && !bssidConfigurations.find(config => instanceId === config.instanceId && config.bssid.toUpperCase() === bssid.toUpperCase())) {
              return true;
            } else if (!bssid && !bssidConfigurations.find(config => instanceId === config.instanceId && config.ssid.toUpperCase() === ssid.toUpperCase()) && connectedSsids.includes(ssid.toUpperCase())) {
              return true;
            }

            return false;
          });

          const updateConfigs = [
            ...bssidConfigurations,
            ...ssidConfigurations,
          ].map(config => ({
            ...config,
            token: (slackInstances.find(({ id }) => id === config.instanceId)).token,
          }));

          resolve(updateConfigs);
        })
        .catch(error => {
          log.error('getConfigurations', error);
          reject(error);
        })
    } catch (error) { }
  })
)

const saveConfiguration = async configuration => (
  new Promise(async (resolve, reject) => {
    try {
      resolve(await storage.set('configurations', [...(await getConfigurations()).filter(({ id }) => id !== configuration.id), configuration]));
    } catch (error) {
      reject(error);
    }
  })
);

const removeConfiguration = async ({ id }) => (
  new Promise(async (resolve, reject) => {
    try {
      resolve(await storage.set('configurations', (await getConfigurations()).filter(configuration => configuration.id !== id)));
    } catch (error) {
      reject(error);
    }
  })
);

const clearConfigurations = async () => (
  new Promise(async (resolve, reject) => {
    const promises = [
      new Promise(async (res, rej) => {
        try {
          res(storage.set('configurations', []));
        } catch (error) {
          rej(error);
        }
      }),
      new Promise(async (res, rej) => {
        try {
          res(storage.set('slackInstances', []));
        } catch (error) {
          rej(error);
        }
      }),
    ];

    return Promise
      .all(promises)
      .then(([configurations, slackInstances]) => {
        resolve();
      })
      .catch(error => {
        log.error('clearConfigurations', error);
        reject(error);
      });
  })
);

module.exports = {
  getConfigurations,
  getEnabledConfigurations,
  saveConfiguration,
  removeConfiguration,
  clearConfigurations,
};
