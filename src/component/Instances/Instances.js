import React from 'react';
import styled from 'styled-components';
import { Menu } from 'antd';

import { Consumer } from '../../container/Context/Context';
import AddInstance from '../AddInstance';

const Instances = () => (
  <Consumer>
    {({ slackInstances, removeSlackInstance, selectInstance, selectedInstance }) => {
      return (
        <React.Fragment>
          <Menu theme="dark" mode="inline" selectedKeys={[selectedInstance]} >
            {slackInstances.sort((a, b) => a.name > b.name).map(instance => (
              <Menu.Item key={instance.id} onClick={selectInstance}>
                <img src={instance.icon.image_34} alt={instance.name} />
                <InstanceName>{instance.name}</InstanceName>
              </Menu.Item>
            ))}
          </Menu>
          <AddInstance mode="text" text="Add new instance" />
        </React.Fragment>
      );
    }}
  </Consumer>
);

const InstanceName = styled.span`
  font-weight: bold;
  margin-left: 5px;
`;

export default Instances;
