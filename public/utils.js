const storage = require('electron-json-storage');
const slack = require('slack');
const wifi = require('node-wifi');
const uuid = require('uuid/v4');

wifi.init({
  iface: null,
});

const fetchWorkspacesInterval = storage.get('fetchWorkspacesInterval') || 5;

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
      const { team } = data;
      resolve(team);
    });
  })
);

const getWorkspaceEmojis = async ({ token }) => (
  new Promise(async (resolve, reject) => {
    slack.emoji.list({ token }, (error, data) => {
      if (error) {
        reject(error);
      }
      const { emoji } = data;
      resolve(emoji);
    });
  })
);

const getConnections = () => (
  new Promise((resolve, reject) => {
    const promises = [
      new Promise((res, rej) => {
        wifi.getCurrentConnections((error, connections) => {
          if (error) {
            rej(error);
          }
          res(connections);
        })
      }),
      new Promise((res, rej) => {
        wifi.scan((error, connections) => {
          if (error) {
            rej(error);
          }
          res(connections);
        })
      }),
    ];

    return Promise
      .all(promises)
      .then(([currentSsids, ssids]) => {
        resolve({
          currentSsids,
          ssids,
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

const fetchWorkspaces = async () => (
  new Promise(async (resolve, reject) => {
    const oldSlackInstances = await getSlackInstances();
    const promises = oldSlackInstances.map(instance => (
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

const saveConfiguration = async (configuration) => (
  new Promise(async (resolve, reject) => {
    const configurations = await getConfigurations();
    storage.set('configurations', [...configurations, configuration], async (error, data) => {
      resolve(configuration);
    });
  })
);

const removeConfiguration = async ({ id }) => (
  new Promise(async (resolve, reject) => {
    const configurations = await getConfigurations();
    storage.set('configurations', configurations.filter(configuration => configuration.id !== id), (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(getConfigurations());
    });

  })
);


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
  fetchWorkspaces,
  fetchWorkspacesInterval,
  getConfigurations,
  saveConfiguration,
  removeConfiguration,
};
