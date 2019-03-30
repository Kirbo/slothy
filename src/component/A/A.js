import React from 'react';
import PropTypes from 'prop-types';

import { openExternal } from '../../assets/utils';

const onClick = (event, external) => {
  if (event.target.dataset.external === 'true') {
    event.preventDefault();
    openExternal(event.target.href);
  }
}

const A = ({ href, name, children, external }) => (
  <a
    href={href}
    onClick={onClick}
    target={external ? "_blank" : '_self'}
    rel="noopener noreferrer"
    aria-label={name}
    data-external={external}
  >
    {children}
  </a>
);

A.propTypes = {
  href: PropTypes.string.isRequired,
  name: PropTypes.string,
  external: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

A.defaultProps = {
  external: false,
  name: 'link',
};

export default A;
