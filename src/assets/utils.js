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
