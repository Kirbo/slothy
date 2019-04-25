/* eslint-disable no-use-before-define */
const slack = require('slack');
const log = require('electron-log');

/**
 * Get status of Slack instance.
 * @param {object} slackInstance - Slack instance to get status from.
 * @returns {object} profile
 */
const getStatus = ({ token }) => (
  new Promise(async (resolve, reject) => {
    try {
      slack.users.profile.get({
        token,
      }, (error, data) => {
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

/**
 * Set status in Slack instance.
 * @param {object} slackInstance - Slack instance to set status into.
 * @returns {object} profile
 */
const setStatus = ({ token, emoji, status }) => (
  new Promise(async (resolve, reject) => {
    try {
      const slackInstances = await getSlackInstances();
      const instance = slackInstances.find(inst => inst.token === token);

      const payload = {
        token,
        profile: JSON.stringify({
          status_text: status,
          status_emoji: emoji,
        }),
      };

      slack.users.profile.set(payload, async (error, data) => {
        if (error) {
          throw error;
        }
        const { profile } = data;
        await updateSlackInstance({
          instance,
          profile,
        });
        resolve(profile);
      });
    } catch (error) {
      log.error('setStatus', error);
      reject(error);
    }
  })
);

/**
 * Update status in all Slack instances.
 */
const updateStatuses = () => {
  Promise(async (resolve, reject) => {
    try {
      (await getEnabledConfigurations())
        .forEach(({ token, emoji, status }) => {
          setStatus({
            status,
            emoji,
            token,
          });
          resolve();
        });
    } catch (error) {
      log.error('updateStatuses', error);
      reject(error);
    }
  });
};

module.exports = {
  getStatus,
  setStatus,
  updateStatuses,
};

const { getSlackInstances, updateSlackInstance } = require('./slackInstances');
const { getEnabledConfigurations } = require('./configurations');
