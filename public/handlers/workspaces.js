const storage = require('../lib/storage');
const slack = require('slack');
const log = require('electron-log');

const { getSlackInstances } = require('./slackInstances');
const { getStatus } = require('./status');

const getWorkspace = async ({ token }) => (
  new Promise(async (resolve, reject) => {
    slack.team.info({ token }, (error, data) => {
      if (error) {
        log.error('getWorkspace', error);
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
        log.error('getWorkspaceEmojis', error);
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

const getWorkspaces = async () => (
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
          log.error('getWorkspaces', error);
          reject(error);
        });
    } catch (error) {}
  })
);

module.exports = {
  getWorkspace,
  getWorkspaceEmojis,
  getWorkspaces,
};
