const slack = require('slack');
const log = require('electron-log');

const { getSlackInstances, updateSlackInstance } = require('./slackInstances');
const { getEnabledConfigurations } = require('./configurations');

const getStatus = async ({ token }) => (
  new Promise(async (resolve, reject) => {
    slack.users.profile.get({ token }, (error, data) => {
      if (error) {
        log.error('getStatus', error);
        reject(error);
      }
      const { profile } = data;
      resolve(profile);
    });
  })
);

const setStatus = async ({ token, emoji, status }) => (
  new Promise(async (resolve, reject) => {
    const slackInstances = await getSlackInstances();
    const instance = slackInstances.find(instance => instance.token === token);

    const payload = {
      token,
      profile: JSON.stringify({
        status_text: status,
        status_emoji: emoji
      })
    };

    slack.users.profile.set(payload, async (error, data) => {
      if (error) {
        log.error('setStatus', error);
        reject(error);
      }
      const { profile } = data;
      await updateSlackInstance({ instance, profile });
      resolve(profile);
    });
  })
);

const updateStatuses = async () => {
  (await getEnabledConfigurations())
    .forEach(({ token, emoji, status }) => {
      setStatus({ status, emoji, token }).catch();
    })
}

module.exports = {
  getStatus,
  setStatus,
  updateStatuses,
};
