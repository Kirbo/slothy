import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

import { COLOR, DIMENSION } from '../../assets/css';

import { ReactComponent as SVG } from '../../assets/icons/fill/logo.svg';
import { ReactComponent as TextSVG } from '../../assets/logo-text/lazy_dog.svg';
// import { ReactComponent as TextSVG } from '../../assets/logo-text/lazy_time.svg';

/**
 * Logo
 * @param {object} props - Properties for the component.
 * @returns {jsx}
 */
const Logo = ({ withText }) => (
  <Styled className="logo" withText={withText}>
    <SVG className="logo" />
    {withText && <TextSVG className="logo-text" />}
  </Styled>
);

Logo.propTypes = {
  withText: PropTypes.bool,
};

Logo.defaultProps = {
  withText: false,
};

const Styled = styled.div`

  ${({ withText }) => withText && css`
    & svg.logo {
      height: 50%;
      margin-right: ${DIMENSION['0.5x']};
    }

    & svg.logo-text {
      height: 35%;
      fill: ${COLOR.darkerGray};
    }
  `}
`;

export default Logo;
