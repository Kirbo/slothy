import React from 'react';
import styled from 'styled-components';
import { Menu, Modal } from 'antd';

import Icon from '../Icon';

import { COLOR } from '../../assets/css';

const { confirm } = Modal;

/**
 * Show confirmation dialog on Slack instance deletion.
 * @param {string} instanceName - Name of the Slack instance to be deleted.
 * @param {function} handleRemove - Callback function to exectute on confirm.
 */
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
};

/**
 * contextMenu
 * @param {object} props - Properties for the component.
 * @returns {jsx}
 */
export const contextMenu = (instance, removeSlackInstance) => (
  <Menu>
    <Menu.Item
      key="remove-instance"
      onClick={() => showDeleteConfirm(instance.name, () => removeSlackInstance(instance.token))}
    >
      <RemoveInstance>
        <Icon icon={['far', 'trash-alt']} /> Remove {instance.name}
      </RemoveInstance>
    </Menu.Item>
  </Menu>
);


const RemoveInstance = styled.div`
  color: ${COLOR.red};
`;
