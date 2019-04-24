const storage = require('electron-json-storage');
const log = require('electron-log');

class Storage {
  /**
   * Get key from storage.
   * @param {string} key - Key to get from storage.
   * @returns - The value of the key.
   */
  async get(key) {
    return new Promise((resolve, reject) => {
      storage.get(key, (error, data) => {
        if (error) {
          log.error(`get ${key}`, error);
          reject(error);
        }
        resolve(data);
      });
    })
  }

  /**
   * Set key into storage.
   * @param {string} key - Key to store in the storage.
   * @param {any} value - Value to store in the storage.
   * @returns - Stored value.
   */
  async set(key, value) {
    return new Promise((resolve, reject) => {
      storage.set(key, value, async (error, data) => {
        if (error) {
          log.error(`set ${key}`, error);
          reject(error);
        }
        resolve(value);
      });
    })
  }
}

module.exports = new Storage();
