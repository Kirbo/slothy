import React from 'react';
import styled from 'styled-components';
import { Menu } from 'antd';

import { Consumer } from '../../container/App/Context';

import Icon from '../Icon';

import { FONT_WEIGHT, DIMENSION } from '../../assets/css';

const AppMenu = () => (
  <Styled>
    <Consumer>
      {({ slackInstances, selectView, selectedView }) => (
        <Menu theme="dark" mode="inline" selectedKeys={[selectedView]}>
          <Menu.Item key="Configuration" onClick={selectView} type="view">
            <Icon icon="cogs" size="2x" />
            <MenuItemName>Configuration</MenuItemName>
          </Menu.Item>
          {slackInstances.sort((a, b) => a.name > b.name).map(instance => (
            <Menu.Item key={instance.id} onClick={selectView} type="instance">
              <img src={instance.icon.image_34} alt={instance.name} />
              <MenuItemName>{instance.name}</MenuItemName>
            </Menu.Item>
          ))}
        </Menu>
      )}
    </Consumer>
  </Styled>
);

const Styled = styled.div`
  & li.ant-menu-item {
    display: flex;
    align-items: center;

    & svg {
    }
  }
`;
const MenuItemName = styled.span`
  font-weight: ${FONT_WEIGHT['bold']};
  margin-left: ${DIMENSION['0.5x']};
`;

export default AppMenu;
