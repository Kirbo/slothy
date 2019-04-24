const slack = require('slack');
const log = require('electron-log');

const getStatus = ({ token }) => (
  new Promise(async (resolve, reject) => {
    try {
      slack.users.profile.get({ token }, (error, data) => {
        if (error) {
          throw error;
        }
        const { profile } = data;
        resolve(profile);
      });
    } catch (error) {
      log.error('getStatus', error);
      reject(error);
    }
  })
);

const setStatus = ({ token, emoji, status }) => (
  new Promise(async (resolve, reject) => {
    try {
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
          throw error;
        }
        const { profile } = data;
        await updateSlackInstance({ instance, profile });
        resolve(profile);
      });
    } catch (error) {
      log.error('setStatus', error);
      reject(error);
    }
  })
);

const updateStatuses = () => {
  new Promise(async (resolve, reject) => {
    try {

      (await getEnabledConfigurations())
        .forEach(({ token, emoji, status }) => {
          setStatus({ status, emoji, token });
          resolve();
        })
    } catch (error) {
      log.error('updateStatuses', error);
      reject(error);
    }
  });
}

module.exports = {
  getStatus,
  setStatus,
  updateStatuses,
};

const { getSlackInstances, updateSlackInstance } = require('./slackInstances');
const { getEnabledConfigurations } = require('./configurations');
