const storage = require('electron-json-storage');
const slack = require('slack');
const wifi = require('node-wifi');
const url = require('url');
const request = require('request');
const packageJson = require('../package.json');
const appConfigs = require('./config');

const protocol = packageJson.product.Protocol;

wifi.init({
  iface: null,
});

const getSlackInstances = async () => (
  new Promise((resolve, reject) => {
    storage.get('slackInstances', (error, data) => {
      if (error) {
        reject(error);
      }
      let instances = [];
      if (data.length) {
        instances = data;
      }
      resolve(instances);
    });
  })
);

const updateSlackInstance = async ({ instance, profile }) => (
  new Promise(async (resolve, reject) => {
    const slackInstances = await getSlackInstances();

    const newSlackInstances = [
      ...slackInstances.filter(i => i.token !== instance.token),
      {
        ...instance,
        profile,
      }
    ];

    storage.set('slackInstances', newSlackInstances, async (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(getSlackInstances());
    });
  })
);

const saveSlackInstance = async (instance) => (
  new Promise(async (resolve, reject) => {
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
    storage.set('slackInstances', [...slackInstances, newInstance], async (error, data) => {
      resolve(newInstance);
    });
  })
);

const removeSlackInstance = async ({ token }) => (
  new Promise(async (resolve, reject) => {
    const slackInstances = await getSlackInstances();
    storage.set('slackInstances', slackInstances.filter(instance => instance.token !== token), (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(getSlackInstances());
    });
  })
);

const getStatus = async ({ token }) => (
  new Promise(async (resolve, reject) => {
    slack.users.profile.get({ token }, (error, data) => {
      if (error) {
        reject(error);
      }
      const { profile } = data;
      resolve(profile);
    });
  })
);

const getWorkspace = async ({ token }) => (
  new Promise(async (resolve, reject) => {
    slack.team.info({ token }, (error, data) => {
      if (error) {
        reject(error);
      }
      if (data) {
        const { team } = data;
        resolve(team);
      }

      resolve({})
    });
  })
);

const getWorkspaceEmojis = async ({ token }) => (
  new Promise(async (resolve, reject) => {
    slack.emoji.list({ token }, (error, data) => {
      if (error) {
        reject(error);
      }
      try {
        const { emoji } = data;
        resolve(emoji);
      } catch (error) {
        console.error(error);
        resolve({});
      }
    });
  })
);

const getCurrentConnections = () => (
  new Promise((res, rej) => {
    wifi.getCurrentConnections((error, connections) => {
      if (error) {
        console.error('error', error);
        rej(error);
      }
      res(connections);
    })
  })
)

const getAvailableConnections = () => (
  new Promise((res, rej) => {
    wifi.scan((error, connections) => {
      if (error) {
        console.error('error', error);
        rej(error);
      }
      res(connections);
    })
  })
)

const getConnections = () => (
  new Promise(async (resolve, reject) => {
    const promises = [
      await getCurrentConnections(),
      await getAvailableConnections(),
    ];

    return Promise
      .all(promises)
      .then(([currentSsids, ssids]) => {
        const connectedBssids = currentSsids.map(({ bssid }) => bssid);
        const connections = ssids
          .map(connection => ({
            ...connection,
            connected: connectedBssids.includes(connection.bssid)
          }))
          .sort((a, b) => {
            if (!a.connected && b.connected) {
              return 1;
            } else if (a.connected && !b.connected) {
              return -1;
            }
            return 0;
          })
          .reduce((result, item) => {
            const group = result.find(connection => connection.ssid === item.ssid);
            if (group) {
              return result.map(connection => {
                if (connection.ssid !== group.ssid) {
                  return connection;
                }

                return {
                  ...connection,
                  accessPoints: [
                    ...(connection.accessPoints || []),
                    {
                      ...item,
                      key: `bssid-${item.bssid}`,
                    }
                  ]
                };
              })
            } else {
              return [...result, {
                ssid: item.ssid,
                key: `group-${item.ssid}`,
                connected: item.connected,
                accessPoints: [{
                  ...item,
                  key: `bssid-${item.bssid}`,
                }]
              }];
            }
          }, []);
        resolve({
          currentSsids,
          ssids: connections,
        });
      });
  })
);

const setStatus = async ({ status, emoji, token }) => (
  new Promise(async (resolve, reject) => {
    const slackInstances = await getSlackInstances();
    const instance = slackInstances.find(
      instance => instance.token === token
    );

    const payload = {
      token,
      profile: JSON.stringify({
        ...instance.profile,
        status_text: status,
        status_emoji: emoji
      })
    };

    slack.users.profile.set(payload, async (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      const { profile } = data;
      await updateSlackInstance({ instance, profile });
      resolve(profile);
    });
  })
);

const getParameterByName = (uri, name) => {
  var match = RegExp(`[?&]${name}=([^&]*)`).exec(uri);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
};

const getWorkspaces = async () => (
  new Promise(async (resolve, reject) => {
    const promises = (await getSlackInstances())
      .map(instance => (
        new Promise(async (res, rej) => {
          const token = { token: instance.token };
          const workspace = await getWorkspace(token);
          const newInstance = {
            ...instance,
            ...workspace,
            emojis: await getWorkspaceEmojis(token),
            profile: await getStatus(token),
          };

          res(newInstance);
        })
      ));

    return Promise
      .all(promises)
      .then(slackInstances => {
        storage.set('slackInstances', [...slackInstances]);
        resolve(slackInstances);
      });
  })
);

const getConfigurations = async () => (
  new Promise((resolve, reject) => {
    storage.get('configurations', (error, data) => {
      if (error) {
        reject(error);
      }
      let configurations = [];
      if (data.length) {
        configurations = data;
      }
      resolve(configurations);
    });
  })
);

const getEnabledConfigurations = async () => (
  new Promise(async (resolve, reject) => {
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
        reject(error);
      })
  })
)

const saveConfiguration = async (configuration) => (
  new Promise(async (resolve, reject) => {
    const configurations = (await getConfigurations()).filter(({ id }) => id !== configuration.id);
    storage.set('configurations', [...configurations, configuration], async (error, data) => {
      resolve(await getConfigurations());
    });
  })
);

const removeConfiguration = async ({ id }) => (
  new Promise(async (resolve, reject) => {
    storage.set('configurations', (await getConfigurations()).filter(configuration => configuration.id !== id), async (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(await getConfigurations());
    });

  })
);

const clearConfigurations = async () => (
  new Promise(async (resolve, reject) => {
    const promises = [
      new Promise(async (res, rej) => {
        storage.set('configurations', [], async (error, data) => {
          if (error) {
            rej(error);
          }
          res(await getConfigurations());
        });
      }),
      new Promise(async (res, rej) => {
        storage.set('slackInstances', [], async (error, data) => {
          if (error) {
            rej(error);
          }
          res(await getSlackInstances());
        });
      }),
    ];

    return Promise
      .all(promises)
      .then(([configurations, slackInstances]) => {
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  })
);

const handleAuth = (sendIfMainWindow, uri) => {
  const { hostname } = url.parse(uri);

  if (hostname === 'auth') {
    const code = getParameterByName(uri, 'code');
    const options = {
      uri: `https://slack.com/api/oauth.access?code=${code}&client_id=${packageJson.product.ClientId}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${protocol}://auth`,
      method: 'GET',
    };

    request(options, async (error, response, body) => {
      const { ok, access_token } = JSON.parse(body);
      if (!ok) {
        sendIfMainWindow('error', () => 'Error in authentication!');
      } else {
        const token = { token: access_token };
        const profile = await getStatus(token);
        const workspace = await getWorkspace(token);

        const slackInstances = await getSlackInstances();
        const existing = slackInstances.find(({ id }) => id === workspace.id);
        if (!existing) {
          let instance;

          if (profile) {
            instance = await saveSlackInstance({
              token: access_token,
              profile,
            });
          }
          sendIfMainWindow('slackInstances', getSlackInstances);
          sendIfMainWindow('newSlackInstance', () => instance);
        } else {
          sendIfMainWindow('error', () => `${existing.name} already exists!`);
        }
      }
    });
  }
}

const sortBy = (property = null) => (a, b) => {
  const leftCompare = property ? a[property] : a;
  const rightCompare = property ? b[property] : b;

  if (leftCompare > rightCompare) {
    return 1;
  } else if (leftCompare < rightCompare) {
    return -1;
  }

  return 0;
};

const uniqueArray = a => (
  [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))
)

const updateStatuses = async () => {
  (await getEnabledConfigurations())
    .forEach(({ token, emoji, status }) => {
      setStatus({ status, emoji, token });
    })
}

const getAppConfigs = async () => (
  new Promise((resolve, reject) => {
    storage.get('appConfigs', (error, data) => {
      if (error) {
        reject(error);
      }

      resolve({
        ...appConfigs,
        ...data,
      });
    });
  })
)

module.exports = {
  getSlackInstances,
  updateSlackInstance,
  saveSlackInstance,
  removeSlackInstance,

  getStatus,
  getWorkspace,
  getWorkspaceEmojis,
  getConnections,
  setStatus,
  getParameterByName,
  getWorkspaces,
  getConfigurations,
  getEnabledConfigurations,
  saveConfiguration,
  removeConfiguration,
  clearConfigurations,
  handleAuth,
  sortBy,
  uniqueArray,

  getAppConfigs,
  updateStatuses,
};
