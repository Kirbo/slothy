import Routes from './routes';

const { shell } = window.require('electron');

/**
 * Sort array with given property.
 * @param {string} [property] - Name of the property to sort with.
 * @returns {array} - Sorted array.
 */
export const sortBy = (property = null) => (a, b) => {
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
 * Open URL in external browser.
 * @param {string} url - URL to open in external browser
 */
export const openExternal = url => {
  shell.openExternal(url);
};

/**
 * Find first enabled route.
 * @returns {object} - First enabled route.
 */
export const findFirstRoute = () => (
  Routes.filter(({ enabled }) => enabled)[0] || {
    name: null,
    type: 'instance',
  }
);

/**
 * Capitalize the given string.
 * @param {string} str - Text to capitalize
 * @returns {string} - Capitalized text.
 */
export const capitalizeFirst = str => (
  `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`
);
