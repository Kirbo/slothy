/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
const isObject = item => (
  item && typeof item === 'object' && !Array.isArray(item)
)

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
const mergeDeep = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

const recursiveObject = (config, newConfig) => (
  Object.keys(config).reduce((newConfigObject, key) => {
    if (isObject(config[key])) {
      newConfigObject[key] = recursiveObject(config[key], newConfig[key]);
      return newConfigObject;
    }
    newConfigObject[key] = newConfig[key];
    return newConfigObject;
  }, {})
);

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

const uniqueArray = a => (
  [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))
)

const getParameterByName = (uri, name) => {
  var match = RegExp(`[?&]${name}=([^&]*)`).exec(uri);
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
