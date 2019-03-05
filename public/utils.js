const storage = require('electron-json-storage');
const slack = require('slack');
const wifi = require('node-wifi');

const dataPath = storage.getDataPath();
console.log(dataPath);
// const interval = storage.get('interval') || 5;

wifi.init({
  iface: null,
});


const getSlackInstances = async () => (
  new Promise((resolve, reject) => {
    storage.get('slackInstances', (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data);
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
    const workspace = await getWorkspace({token: instance.token});
    const newInstance = {
      ...instance,
      ...workspace,
      emojis: [],
      token: instance.token,
    };

    const slackInstances = await getSlackInstances();
    storage.set('slackInstances', [...slackInstances, newInstance], async (error, data) => {
      resolve(getSlackInstances());
    });
  })
);

const removeSlackInstance = async ({token}) => (
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

const getStatus = async ({token}) => (
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

const getWorkspace = async ({token}) => (
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
      await updateSlackInstance({instance, profile});
      resolve(profile);
    });
  })
);

const getParameterByName = (uri, name) => {
  var match = RegExp(`[?&]${name}=([^&]*)`).exec(uri);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
};

module.exports = {
  getSlackInstances,
  updateSlackInstance,
  saveSlackInstance,
  removeSlackInstance,
  getStatus,
  getWorkspace,
  getConnections,
  setStatus,
  getParameterByName,
};
