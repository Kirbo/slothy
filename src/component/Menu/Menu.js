import React from 'react';
import styled from 'styled-components';
import { Menu, Dropdown } from 'antd';

import { Consumer } from '../../container/App/Context';

import Icon from '../Icon';

import { DIMENSION, FONT_WEIGHT } from '../../assets/css';

import Routes from '../../assets/routes';

import { contextMenu } from './MenuConfig';

const AppMenu = () => (
  <Styled>
    <Consumer>
      {({ slackInstances, selectView, selectedView, removeSlackInstance }) => (
        <Menu theme="dark" mode="inline" selectedKeys={[selectedView]}>
          {Routes.filter(({ enabled }) => enabled).map(({ name, type, icon }) => (
            <Menu.Item key={name} onClick={selectView} type={type}>
              <div>
                <Icon icon={icon} size="2x" />
                <MenuItemName>{name}</MenuItemName>
              </div>
            </Menu.Item>
          ))}
          {slackInstances.sort((a, b) => a.name > b.name).map(instance => {
            return (
              <Menu.Item key={instance.id} type="instance" onClick={selectView}>
                <Dropdown overlay={contextMenu(instance, removeSlackInstance)} trigger={['contextMenu']} placement="bottomRight">
                  <div>
                    <img src={instance.icon.image_34} alt={instance.name} />
                    <MenuItemName>{instance.name}</MenuItemName>
                  </div>
                </Dropdown>
              </Menu.Item>
            );
          })}
        </Menu>
      )}
    </Consumer>
  </Styled>
);

const Styled = styled.div`
  & li.ant-menu-item {
    display: flex;
    align-items: center;
    padding: 0 !important;
    margin: 0;

    & div {
      display: flex;
      align-items: center;
      width: 100%;
      padding-left: ${DIMENSION['1.5x']};

      & svg {
        width: 2.429rem;
        padding: 0.25rem;
        height: 2.429rem;
      }
    }
  }
`;
const MenuItemName = styled.span`
  font-weight: ${FONT_WEIGHT['bold']};
  margin-left: ${DIMENSION['0.5x']};
`;

export default AppMenu;
