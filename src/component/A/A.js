import React from 'react';
import PropTypes from 'prop-types';

import { openExternal } from '../../assets/utils';

/**
 * Handle onClick event.
 * @param {event} event - Onclick event
 */
const handleClick = event => {
  if (event.target.dataset.external === 'true') {
    event.preventDefault();
    openExternal(event.target.href);
  }
};

/**
 * Common component for links.
 * @param {object} props - Properties for the component.
 * @returns {html} <a />
 */
const A = ({ href, name, children, external }) => (
  <a
    href={href}
    onClick={handleClick}
    target={external ? '_blank' : '_self'}
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
  children: null,
};

A.defaultProps = {
  external: false,
  name: 'link',
};

export default A;
