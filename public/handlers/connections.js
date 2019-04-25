/* eslint-disable no-use-before-define */
const wifi = require('node-wifi');
const log = require('electron-log');

wifi.init({
  iface: null,
});

/**
 * Get currently connected ssids.
 * @returns {array} currentConnections
 */
const getCurrentConnections = () => (
  new Promise((resolve, reject) => {
    try {
      wifi.getCurrentConnections((error, connections) => {
        if (error) {
          throw error;
        }
        resolve(connections);
      });
    } catch (error) {
      log.error('getCurrentConnections', error);
      reject(error);
    }
  })
);

/**
 * Scan available ssids.
 * @returns {array} availableConnections
 */
const getAvailableConnections = () => (
  new Promise((resolve, reject) => {
    try {
      wifi.scan((error, connections) => {
        if (error) {
          throw error;
        }
        resolve(connections);
      });
    } catch (error) {
      log.error('getAvailableConnections', error);
      reject(error);
    }
  })
);

/**
 * Get both connected and available connections.
 * @returns {object}
 */
const getConnections = () => (
  new Promise(async (resolve, reject) => {
    try {
      const promises = [
        await getCurrentConnections(),
        await getAvailableConnections(),
      ];

      return Promise
        .all(promises)
        .then(([currentSsids, ssids]) => {
          const connectedBssids = currentSsids.map(({ bssid }) => bssid);
          const connections = ssids
            .map(connection => ({
              ...connection,
              connected: connectedBssids.includes(connection.bssid),
            }))
            .sort((a, b) => {
              if (!a.connected && b.connected) {
                return 1;
              } else if (a.connected && !b.connected) {
                return -1;
              }
              return 0;
            })
            .reduce((result, item) => {
              const group = result.find(connection => connection.ssid === item.ssid);
              if (group) {
                return result.map(connection => {
                  if (connection.ssid !== group.ssid) {
                    return connection;
                  }

                  return {
                    ...connection,
                    accessPoints: [
                      ...(connection.accessPoints || []),
                      {
                        ...item,
                        key: `bssid-${item.bssid}`,
                      },
                    ],
                  };
                });
              }
              return [...result, {
                ssid: item.ssid,
                key: `group-${item.ssid}`,
                connected: item.connected,
                accessPoints: [{
                  ...item,
                  key: `bssid-${item.bssid}`,
                }],
              }];
            }, []);
          resolve({
            currentSsids,
            ssids: connections,
          });
        });
    } catch (error) {
      log.error('getConnections', error);
      reject(error);
      return error;
    }
  })
);

module.exports = {
  getCurrentConnections,
  getAvailableConnections,
  getConnections,
};
