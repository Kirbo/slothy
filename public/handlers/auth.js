/* eslint-disable no-use-before-define */
const url = require('url');
const request = require('request');
const log = require('electron-log');

const packageJson = require('../../package.json');
const { getParameterByName } = require('../lib/utils');

const protocol = packageJson.product.Protocol;

/**
 * Handles authentication.
 * @param {function} sendIfMainWindow - Callback function.
 * @param {string} uri - URI.
 */
const handleAuth = (sendIfMainWindow, uri) => {
  try {
    const { hostname } = url.parse(uri);

    if (hostname === 'auth') {
      const code = getParameterByName(uri, 'code');
      const options = {
        uri: `https://slack.com/api/oauth.access?code=${code}&client_id=${packageJson.product.ClientId}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${protocol}://auth`,
        method: 'GET',
      };

      request(options, async (error, response, body) => {
        const { ok, accessToken } = JSON.parse(body);
        if (!ok) {
          sendIfMainWindow('error', () => 'Error in authentication!');
          throw error;
        } else {
          const token = {
            token: accessToken,
          };
          const profile = await getStatus(token);
          const workspace = await getWorkspace(token);

          const slackInstances = await getSlackInstances();
          const existing = slackInstances.find(({ id }) => id === workspace.id);
          if (!existing) {
            let instance;

            if (profile) {
              instance = await saveSlackInstance({
                token: accessToken,
                profile,
              });
            }
            sendIfMainWindow('slackInstances', getSlackInstances);
            sendIfMainWindow('newSlackInstance', () => instance);
          } else {
            log.error('handleAuth', `${existing.name} already exists!`);
            sendIfMainWindow('error', () => `${existing.name} already exists!`);
          }
        }
      });
    }
  } catch (error) {
    log.error('handleAuth', error);
  }
};

module.exports = {
  handleAuth,
};

const { getStatus } = require('./status');
const { getWorkspace } = require('./workspaces');
const { getSlackInstances, saveSlackInstance } = require('./slackInstances');
