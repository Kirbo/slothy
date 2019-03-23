import React from 'react';
import styled from 'styled-components';
import { Layout } from 'antd';

import { Consumer } from '../Context/Context';

import Instances from '../../component/Instances';
import Instance from '../../component/Instance';

const { Sider } = Layout;

const Home = () => (
  <Consumer>
    {({ ssidsLoaded, currentSsids, ssids, slackInstances, setStatus, getConnections, selectedInstance }) => (
      <StyledHome>
        <Layout>
          <Sider style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}>
            <Logo>
              Sloth
              </Logo>
            <Instances />
          </Sider>
          <Layout style={{ marginLeft: 200 }}>
            {selectedInstance ? <Instance /> : 'Select an instance from the left'}
          </Layout>
        </Layout>
      </StyledHome>
    )}
  </Consumer>
);

const StyledHome = styled.div`
  width: 100%;
  height: 100%;

  & .ant-layout {
    height: 100%;
  }
`;
const Logo = styled.div`
  color: #000;
`;

export default Home;
