import React from 'react';
import styled from 'styled-components';
import { Layout } from 'antd';

import { Consumer } from './Context';

import NotAuthorized from '../NotAuthorized';

import AppSider from '../../component/AppSider';
import View from '../View';

/**
 * Authorized
 * @returns {jsx}
 */
const Authorized = () => (
  <Consumer>
    {({ showLoading }) => (
      <Styled showLoading={showLoading}>
        <Layout>
          <AppSider />
          <View />
        </Layout>
      </Styled>
    )}
  </Consumer>
);

/**
 * App
 * @returns {jsx}
 */
const App = () => (
  <Consumer>
    {({ slackInstances }) => (slackInstances.length > 0 ? <Authorized /> : <NotAuthorized />)}
  </Consumer>
);

const Styled = styled.div`
  width: 100%;
  min-height: 100vh;
  overflow: hidden;

  ${({ showLoading }) => showLoading && `
    width: 100vw;
    height: 100vh;
  `}

  & .ant-layout {
    min-height: 100vh;
  }
`;


export default App;
