/* eslint-disable no-use-before-define */
const slack = require('slack');
const log = require('electron-log');

const storage = require('../lib/storage');

/**
 * Get workspace from Slack instance.
 * @param {object} slackInstance - Slack instance to get workspace from.
 * @returns {object} team
 */
const getWorkspace = ({ token }) => (
  new Promise(async (resolve, reject) => {
    try {
      slack.team.info({
        token,
      }, (error, data) => {
        if (error) {
          throw error;
        }
        if (data) {
          const { team } = data;
          resolve(team);
        }

        resolve({
        });
      });
    } catch (error) {
      log.error('getWorkspace', error);
      reject(error);
    }
  })
);

/**
 * Get custom emojis from Slack instance.
 * @param {object} slackInstance - Slack instance to fetch emojis from.
 * @returns {object} emojis
 */
const getWorkspaceEmojis = ({ token }) => (
  new Promise(async (resolve, reject) => {
    try {
      slack.emoji.list({
        token,
      }, (err, data) => {
        if (err) {
          throw err;
        }
        try {
          const { emoji } = data;
          resolve(emoji);
        } catch (error) {
          resolve({
          });
        }
      });
    } catch (error) {
      log.error('getWorkspaceEmojis', error);
      reject(error);
    }
  })
);

/**
 * Get workspace from all Slack instances.
 * @returns {array} slackInstances
 */
const getWorkspaces = () => (
  new Promise(async (resolve, reject) => {
    try {
      const promises = (await getSlackInstances())
        .map(instance => (
          new Promise(async res => {
            const token = {
              token: instance.token,
            };
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
        .then(async slackInstances => {
          resolve(await storage.set('slackInstances', [...slackInstances]));
        })
        .catch(error => {
          throw error;
        });
    } catch (error) {
      log.error('getWorkspaces', error);
      reject(error);
      return error;
    }
  })
);

module.exports = {
  getWorkspace,
  getWorkspaceEmojis,
  getWorkspaces,
};

const { getSlackInstances } = require('./slackInstances');
const { getStatus } = require('./status');
