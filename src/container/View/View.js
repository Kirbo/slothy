import React from 'react';
import styled from 'styled-components';
import { Layout } from 'antd';

import { Consumer } from '../App/Context';

import Instance from './Instance';

/**
 * AppView.
 * @returns {jsx}
 */
const AppView = () => (
  <Consumer>
    {({ viewType, selectedView }) => {
      let View = Instance;

      if (viewType === 'view') {
        View = require(`./${selectedView}/${selectedView}.js`).default; // eslint-disable-line
      }

      return (
        <StyledView>
          <Layout>
            <View />
          </Layout>
        </StyledView>
      );
    }}
  </Consumer>
);

const StyledView = styled.div`
  display: flex;
  flex: 1 1 100%;
  max-width: calc(100vw - 200px);
  overflow: auto;

  & .ant-layout {
    max-width: 100%;
  }
`;

export default AppView;
