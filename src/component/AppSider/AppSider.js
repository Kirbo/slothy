import React from 'react';
import styled from 'styled-components';
import { Layout } from 'antd';

import { Consumer } from '../../container/App/Context';
import Menu from '../Menu';
import AddInstance from '../AddInstance';

import { BORDER, COLOR, DIMENSION } from '../../assets/css';
import { COPYRIGHT_YEAR } from '../../assets/constants';

const { Sider, Footer } = Layout;


const AppSider = () => (
  <StyledSider>
    <Consumer>
      {({ slackInstances, removeSlackInstance, selectInstance, selectedView }) => (
        <Sider>
          <Logo>Sloth</Logo>
          <Scrollable>
            <Menu />
            <AddInstance mode="text" text="Add new instance" />
          </Scrollable>
          <Footer>
            Kirbo © {COPYRIGHT_YEAR}
          </Footer>
        </Sider>
      )}
    </Consumer>
  </StyledSider>
);

const LOGO_HEIGHT = '5rem';

const Logo = styled.div`
  color: #000;
  background: ${COLOR['darkBlue']};
  color: ${COLOR['white']};
  flex: 0;
  align-items: center;
  justify-content: center;
  display: flex;
  flex: 0 0 ${LOGO_HEIGHT};
`;

const Scrollable = styled.div`
  overflow: auto;
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;
  min-height: 0;
  height: calc(100% - 10rem);
`;

const StyledSider = styled.div`
  display: flex;
  flex: 0 0 200px;

  & .ant-layout-sider {
    overflow: hidden;
    display: flex;
    position: fixed;
    left: 0;
    background: ${COLOR['darkBlue']};
    height: 100%;
    flex: 0;

    & .ant-menu-dark,
    & .ant-menu-dark
    & .ant-menu-sub {
      background: ${COLOR['darkBlue']};
    }

    & .ant-layout-sider-children {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
  }

  & .ant-layout-footer {
    padding: ${DIMENSION['0.5x']} 0;
    margin: 0 ${DIMENSION['0.5x']};
    background: ${COLOR['darkBlue']};
    color: ${COLOR['lightGray']};
    border-top: ${BORDER['thin']} solid ${COLOR['borderDark']};
    justify-content: center;
    flex: 0 0 ${DIMENSION['3x']};
    display: flex;
  }
`;

export default AppSider;
