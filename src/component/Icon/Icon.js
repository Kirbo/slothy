import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

import { DIMENSION } from '../../assets/css';

library.add(fas, far, fab);

/**
 * Icon
 * @param {object} props - Properties for the component.
 * @returns {jsx}
 */
const Icon = ({ icon, size }) => (
  <FAIcon icon={icon} size={size} />
);

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.keys(DIMENSION)),
};

Icon.defaultProps = {
  size: '1x',
};

export default Icon;
