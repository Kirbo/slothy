import React from 'react';
import styled from 'styled-components';
import { Layout } from 'antd';

import A from '../A';
import Menu from '../Menu';
import AddInstance from '../AddInstance';
import Logo from '../Logo';

import { BORDER, COLOR, DIMENSION, FONT_SIZE } from '../../assets/css';
import { COPYRIGHT } from '../../assets/constants';

import packageJSON from '../../../package.json';

const { Sider, Footer } = Layout;

const AppSider = () => (
  <Styled>
    <Sider>
      <Logo withText />
      <Scrollable>
        <Menu />
        <AddInstance mode="text" text="Add new instance" />
      </Scrollable>
      <Footer>
        <A href={packageJSON.product.Pages} name="copyright link" external>{COPYRIGHT}</A>
      </Footer>
    </Sider>
  </Styled>
);

const Scrollable = styled.div`
  overflow: auto;
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;
  min-height: 0;
  height: calc(100% - 10rem);
`;

const Styled = styled.div`
  display: flex;
  flex: 0 0 200px;
  z-index: 100;

  & div.logo {
    height: ${DIMENSION['5x']};
    min-height: ${DIMENSION['5x']};
    max-height: ${DIMENSION['5x']};
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
  }

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
    padding: 0;
    margin: 0 ${DIMENSION['0.5x']};
    background: ${COLOR['darkBlue']};
    color: ${COLOR['lightGray']};
    border-top: ${BORDER['thin']} solid ${COLOR['borderDark']};
    justify-content: center;
    flex: 0 0 ${DIMENSION['2.25x']};
    display: flex;
    align-items: center;
    font-size: ${FONT_SIZE['regular']};

    & a {
      color: ${COLOR['lightGray']};

      &:hover {
        color: ${COLOR['red']};
      }
    }
  }
`;

export default AppSider;
