import React from 'react';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

library.add(fas, far, fab);

const Icon = ({ icon, size = "1x" }) => (
  <FAIcon icon={icon} size={size} />
);


export default Icon;
