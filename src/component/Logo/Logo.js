import React from 'react';
import styled, { css } from 'styled-components';

import { COLOR, DIMENSION } from '../../assets/css';

import { ReactComponent as SVG } from '../../assets/icons/fill/logo.svg';
import { ReactComponent as TextSVG } from '../../assets/logo-text/lazy_dog.svg';
// import { ReactComponent as TextSVG } from '../../assets/logo-text/lazy_time.svg';

const Logo = ({ theme, withText }) => (
  <Styled className="logo" withText={withText}>
    <SVG className="logo" />{withText && <TextSVG className="logo-text" />}
  </Styled>
);

const Styled = styled.div`

  ${({withText}) => css`
    & svg.logo {
      height: 50%;
      margin-right: ${DIMENSION['0.5x']};
    }

    & svg.logo-text {
      height: 35%;
      fill: ${COLOR['darkerGray']};
    }
  `}
`;

export default Logo;
