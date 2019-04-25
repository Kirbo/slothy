import React from 'react';
import styled, { css } from 'styled-components';
import { Tooltip } from 'antd';

import Emoji from '../../../component/Emoji';
import ModifyButton from '../../../component/ModifyButton';
import Icon from '../../../component/Icon';

import { FONT_WEIGHT } from '../../../assets/css';

/**
 * Shared column configurations.
 * @param {function} saveConfiguration - Callback function to save configuration.
 * @returns {array} sharedColumns
 */
const sharedColumns = saveConfiguration => [
  {
    title: 'Emoji',
    dataIndex: 'emoji',
    className: 'emoji',
    render: (text, { config }) => config && config.emoji && (
      <Tooltip placement="top" title={<Emoji emoji={config.emoji} slackInstanceId={config.instanceId} size="xxxl" />} arrowPointAtCenter>
        <span>
          <Emoji emoji={config.emoji} slackInstanceId={config.instanceId} />
        </span>
      </Tooltip>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    className: 'status',
    render: (text, { config }) => config && config.status && (
      <Ellipsis>
        <Tooltip placement="top" title={config.status} arrowPointAtCenter>
          {config.status}
        </Tooltip>
      </Ellipsis>
    ),
  },
  {
    title: 'Enabled',
    dataIndex: 'enabled',
    className: 'enabled',
    render: (text, { config }) => (
      <Enabled
        id={config.id}
        onClick={() => saveConfiguration({
          ...config,
          enabled: !config.enabled,
        }, false)}
      >
        {(
          config && Object.prototype.hasOwnProperty.call(config, 'id') // eslint-disable-line no-nested-ternary
            ? (config && config.enabled === true ? <Icon icon="check" /> : <Icon icon="times" />)
            : null
        )}
      </Enabled>
    ),
  },
  {
    title: 'Config',
    className: 'setup',
    render: (text, record) => <ModifyButton record={record} />,
  },
];

const ssidColumn = {
  title: 'SSID',
  dataIndex: 'ssid',
  className: 'ssid',
  render: (text, { connected }) => (
    <Ellipsis>
      <Tooltip placement="top" title={text} arrowPointAtCenter>
        <SsidName connected={connected}>{text}</SsidName>
      </Tooltip>
    </Ellipsis>
  ),
};

const bssidColumn = {
  title: 'Access Point',
  dataIndex: 'bssid',
  className: 'bssid',
  render: (text, { connected }) => (
    <Ellipsis>
      <Tooltip placement="top" title={text ? text.toUpperCase() : ''} arrowPointAtCenter>
        <BssidName connected={connected}>{text}</BssidName>
      </Tooltip>
    </Ellipsis>
  ),
};

/**
 * Table configurations for columns.
 * @param {function} saveConfiguration - Callback function to handle configuration saving.
 * @returns {array} columns
 */
export const columns = saveConfiguration => [
  ssidColumn,
  ...sharedColumns(saveConfiguration),
];

/**
 * Table configurations for nestedColumns.
 * @param {function} saveConfiguration - Callback function to handle configuration saving.
 * @returns {array} nestedColumns
 */
export const nestedColumns = saveConfiguration => [
  bssidColumn,
  ...sharedColumns(saveConfiguration),
];

/**
 * Table configurations for configurationsColumns.
 * @param {function} saveConfiguration - Callback function to handle configuration saving.
 * @param {array} slackInstances - Slack instances.
 * @returns {array} configurationsColumns
 */
export const configurationsColumns = (saveConfiguration, slackInstances) => [
  {
    title: 'Slack',
    dataIndex: 'instanceId',
    className: 'slack',
    render: (text, { config }) => {
      const instance = slackInstances.find(({ id }) => id === config.instanceId) || {
        name: 'Unkown - deleted?',
      };
      return (
        <Ellipsis>
          <Tooltip placement="top" title={instance.name} arrowPointAtCenter>
            <span>{instance.name}</span>
          </Tooltip>
        </Ellipsis>
      );
    },
  },
  ssidColumn,
  bssidColumn,
  ...sharedColumns(saveConfiguration),
];

export const tableConfig = {
  rowKey: 'key',
  pagination: false,
  rowClassName: ({ config }) => `config-${config && !!config.enabled ? 'enabled' : 'disabled'}`,
};

export const SsidName = styled.span`
  font-weight: ${FONT_WEIGHT.bold};

  ${props => props.connected && css`
    color: red;
  `}
`;

export const BssidName = styled.span`
  font-weight: ${FONT_WEIGHT.regular};

  ${props => props.connected && css`
    color: red;
  `}
`;

export const Enabled = styled.span`
  ${({ id }) => id && css`
    cursor: pointer;
  `}
`;

export const Ellipsis = styled.div`
  font-weight: ${FONT_WEIGHT.regular};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;
