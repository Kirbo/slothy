import React from 'react';
import styled from 'styled-components';
import { Menu, Modal } from 'antd';

import Icon from '../Icon';

import { COLOR } from '../../assets/css';

const { confirm } = Modal;

export const contextMenu = (instance, removeSlackInstance) => (
  <Menu>
    <Menu.Item
      key="remove-instance"
      onClick={() => showDeleteConfirm(instance.name, () => removeSlackInstance(instance.token))}
    >
      <RemoveInstance>
        <Icon icon={["far", "trash-alt"]} /> Remove {instance.name}
      </RemoveInstance>
    </Menu.Item>
  </Menu>
);

export const showDeleteConfirm = (instanceName, handleRemove) => {
  confirm({
    title: 'Confirm removing Slack instance',
    content: `Are you sure remove Slack instance: ${instanceName}?`,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk() {
      handleRemove();
    },
  });
}

const RemoveInstance = styled.div`
  color: ${COLOR['red']};
`;
