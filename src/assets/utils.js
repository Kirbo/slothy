import Routes from './routes';

const { shell } = window.require('electron');

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

export const openExternal = url => {
  shell.openExternal(url);
};

export const findFirstRoute = () => (
  Routes.filter(({ enabled }) => enabled)[0] || {
    name: null,
    type: 'instance',
  }
);


export const capitalizeFirst = str => (
  `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`
);
