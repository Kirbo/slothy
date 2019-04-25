/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
const isObject = item => (
  item && typeof item === 'object' && !Array.isArray(item)
);

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
const mergeDeep = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, {
            [key]: {
            },
          });
        }
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, {
          [key]: source[key],
        });
      }
    });
  }

  return mergeDeep(target, ...sources);
};

/**
 * Recursively merge two objects (based on old object properties).
 * @param {object} oldObject - Old object to merge into.
 * @param {object} newObject - New object to merge from.
 * @returns {object} mergedObject
 */
const recursiveObject = (oldObject, newObject) => (
  Object.keys(oldObject).reduce((mergedObject, key) => {
    if (isObject(oldObject[key])) {
      mergedObject[key] = recursiveObject(oldObject[key], newObject[key]);
      return mergedObject;
    }
    mergedObject[key] = newObject[key];
    return mergedObject;
  }, {
  })
);

/**
 * Sort array by property.
 * @param {string} [property] - Property to sort array by.
 * @returns {array} sortedArray
 */
const sortBy = (property = null) => (a, b) => {
  const leftCompare = property ? a[property] : a;
  const rightCompare = property ? b[property] : b;

  if (leftCompare > rightCompare) {
    return 1;
  } else if (leftCompare < rightCompare) {
    return -1;
  }

  return 0;
};

/**
 * Get uniques from array.
 * @param {array} array - Array to filter uniques from.
 * @returns {array} uniqueArray
 */
const uniqueArray = array => (
  [...new Set(array.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))
);

/**
 * Get parameter from URI.
 * @param {string} uri - URI
 * @param {string} name - Parameter name to get
 * @returns {string} parameterValue
 */
const getParameterByName = (uri, name) => {
  const match = RegExp(`[?&]${name}=([^&]*)`).exec(uri);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
};


module.exports = {
  isObject,
  mergeDeep,
  recursiveObject,
  sortBy,
  uniqueArray,
  getParameterByName,
};
