import React from 'react';
import styled, { css } from 'styled-components';

import Emoji from '../../component/Emoji';
import ModifyButton from '../../component/ModifyButton';
import Icon from '../../component/Icon';

import { FONT_WEIGHT } from '../../assets/css';

const sharedColumns = [
  {
    title: 'Emoji',
    dataIndex: 'emoji',
    className: 'emoji',
    render: (text, { config }) => config && config.emoji && <Emoji emoji={config.emoji} />
  },
  {
    title: 'Status',
    dataIndex: 'status',
    className: 'status',
    render: (text, { config }) => config && config.status && <Ellipsis>{config.status}</Ellipsis>
  },
  {
    title: 'Enabled',
    dataIndex: 'enabled',
    className: 'enabled',
    render: (text, { enabled }) => enabled ? <Icon icon="check" /> : <Icon icon="times" />,
  },
  {
    title: 'Config',
    className: 'setup',
    render: (text, record) => <ModifyButton record={record} />,
  },
]

export const columns = [
  {
    title: 'SSID',
    dataIndex: 'ssid',
    render: (text, { connected }) => <SsidName connected={connected}>{text}</SsidName>
  },
  ...sharedColumns,
];

export const nestedColumns = [
  {
    title: 'BSSID',
    dataIndex: 'bssid',
    className: 'bssid',
    render: (text, { bssid, connected }, index) => <BssidName connected={connected}>{text}</BssidName>
  },
  ...sharedColumns,
];

export const tableConfig = {
  rowKey: 'key',
  pagination: false,
  rowClassName: (record, index) => `config-${record.enabled ? 'enabled' : 'disabled'}`,
};

export const SsidName = styled.div`
  font-weight: ${FONT_WEIGHT['bold']};
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: contents;

  ${props => props.connected && css`
    color: red;
  `}
`;

export const BssidName = styled.div`
  font-weight: ${FONT_WEIGHT['regular']};
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: contents;

  ${props => props.connected && css`
    color: red;
  `}
`;

export const Ellipsis = styled.div`
  font-weight: ${FONT_WEIGHT['regular']};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;
