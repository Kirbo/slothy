import React from 'react';
import styled from 'styled-components';
import { Layout } from 'antd';

import { Consumer } from '../../container/App/Context';

import Instance from '../../view/Instance';

const AppView = () => (
  <Consumer>
    {({ viewType, selectedView }) => {
      let View = Instance;

      if (viewType === 'view') {
        View = require(`../../view/${selectedView}/${selectedView}.js`).default;
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
  & .ant-layout {
    margin-left: 200px;
    width: 100%;
  }
`;

export default AppView;
