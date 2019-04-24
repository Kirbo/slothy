const slack = require('slack');
const log = require('electron-log');

const storage = require('../lib/storage');

const getWorkspace = ({ token }) => (
  new Promise(async (resolve, reject) => {
    try {
      slack.team.info({ token }, (error, data) => {
        if (error) {
          throw new Error(error);
        }
        if (data) {
          const { team } = data;
          resolve(team);
        }

        resolve({})
      });
    } catch (error) {
      log.error('getWorkspace', error);
      reject(error);
    }
  })
);

const getWorkspaceEmojis = ({ token }) => (
  new Promise(async (resolve, reject) => {
    try {
      slack.emoji.list({ token }, (error, data) => {
        if (error) {
          throw new Error(error);
        }
        try {
          const { emoji } = data;
          resolve(emoji);
        } catch (error) {
          resolve({});
        }
      });
    } catch (error) {
      log.error('getWorkspaceEmojis', error);
      reject(error);
    }
  })
);

const getWorkspaces = () => (
  new Promise(async (resolve, reject) => {
    try {
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
        .then(async slackInstances => {
          resolve(await storage.set('slackInstances', [...slackInstances]));
        })
        .catch(error => {
          throw new Error(error);
        });
    } catch (error) {
      log.error('getWorkspaces', error);
      reject(error);
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
