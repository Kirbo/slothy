const storage = require('electron-json-storage');
const log = require('electron-log');

const Storage = {
  /**
   * Get key from storage.
   * @param {string} key - Key to get from storage.
   * @returns - The value of the key.
   */
  get: async key => new Promise((resolve, reject) => {
    storage.get(key, (error, data) => {
      if (error) {
        log.error(`get ${key}`, error);
        reject(error);
      }
      resolve(data);
    });
  }),

  /**
   * Set key into storage.
   * @param {string} key - Key to store in the storage.
   * @param {any} value - Value to store in the storage.
   * @returns - Stored value.
   */
  set: async (key, value) => new Promise((resolve, reject) => {
    storage.set(key, value, async error => {
      if (error) {
        log.error(`set ${key}`, error);
        reject(error);
      }
      resolve(value);
    });
  }),
};

module.exports = Storage;
