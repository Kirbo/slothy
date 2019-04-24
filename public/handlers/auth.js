const url = require('url');
const request = require('request');
const log = require('electron-log');

const packageJson = require('../../package.json');
const { getParameterByName } = require('../lib/utils');

const protocol = packageJson.product.Protocol;

const handleAuth = (sendIfMainWindow, uri) => {
  try {
    const { getStatus } = require('./status');
    const { getWorkspace } = require('./workspaces');
    const { getSlackInstances, saveSlackInstance } = require('./slackInstances');

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
          throw new Error(error);
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
            log.error('handleAuth', `${existing.name} already exists!`);
            sendIfMainWindow('error', () => `${existing.name} already exists!`);
          }
        }
      });
    }
  } catch (error) {
    log.error('handleAuth', error);
  }
}

module.exports = {
  handleAuth,
};
