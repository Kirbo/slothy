import React from 'react';
import styled from 'styled-components';

import { Consumer } from '../Context/Context';

import parentPackageJSON from '../../../../package.json';

const StyledHome = styled.div`
  width: 100%;
  height: 100%;
`;

const Home = () => (
  <Consumer>
    {(context) => (
      <StyledHome>
        <h1>{parentPackageJSON.name}</h1>
      </StyledHome>
    )}
  </Consumer>
);

export default Home;
