import React from 'react';
import styled from 'styled-components';
import { Layout } from 'antd';

import { Consumer } from '../../container/App/Context';
import Menu from '../Menu';
import AddInstance from '../AddInstance';

import { COLOR, DIMENSION } from '../../assets/css';
import { COPYRIGHT_YEAR } from '../../assets/constants';

const { Sider, Footer } = Layout;


const AppSider = () => (
  <StyledSider>
    <Consumer>
      {({ slackInstances, removeSlackInstance, selectInstance, selectedView }) => (
        <Sider>
          <Logo>Sloth</Logo>
          <Menu />
          <AddInstance mode="text" text="Add new instance" />
          <Footer>
            Kirbo © {COPYRIGHT_YEAR}
          </Footer>
        </Sider>
      )}
    </Consumer>
  </StyledSider>
);

const Logo = styled.div`
  color: #000;
`;

const StyledSider = styled.div`
  & .ant-layout-sider {
    overflow: auto;
    height: 100vh;
    position: fixed;
    left: 0;
  }

  & .ant-layout-footer {
    position: absolute;
    bottom: 0;
    padding: ${DIMENSION['0.5x']} 0;
    width: 100%;
    background: ${COLOR['darkBlue']};
    color: ${COLOR['lightGray']};
    text-align: center;
  }
`;

export default AppSider;
