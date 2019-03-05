import React from 'react';
import styled from 'styled-components';

import { Consumer } from '../Context/Context';

import A from '../../component/A';

import parentPackageJSON from '../../../../package.json';

const StyledHome = styled.div`
  width: 100%;
  height: 100%;
`;

const Home = () => (
  <Consumer>
    {(context) => (
      <StyledHome>
        <h1>{parentPackageJSON.productName}</h1>
        <div>
          This repository is maintained in <A href={parentPackageJSON.product.GitLabRepository}>GitLab</A>,
          the <A href={parentPackageJSON.product.GitHubRepository}>GitHub</A> is just mirroring the Protected branches from GitLab and serves the releases.
          In case you want to contribute for this project, do it <A href={parentPackageJSON.product.GitLabRepository}>here</A>.
        </div>
        <div>
          Releases can be found in <A href={parentPackageJSON.productUrl}>{parentPackageJSON.productUrl}</A>.
        </div>
      </StyledHome>
    )}
  </Consumer>
);

export default Home;
