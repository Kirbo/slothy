import React from 'react';
import styled, { css } from 'styled-components';
import { Layout, Table } from 'antd';

import Emoji from '../../component/Emoji';
import { Consumer } from '../../container/App/Context';

import { FONT_SIZE, FONT_WEIGHT, BORDER, DIMENSION, COLOR } from '../../assets/css';

const { Header, Content } = Layout;

const columns = [
  {
    title: 'SSID',
    dataIndex: 'ssid',
    render: (text, { bssid, current }, index) => (
      <SsidName current={current}>{text}</SsidName>
    )
  },
  {
    title: 'BSSID',
    dataIndex: 'bssid',
  },
  {
    title: 'Emoji',
    dataIndex: 'emoji',
    render: (text, { emoji }, index) => emoji && <Emoji emoji={emoji} />
  },
  {
    title: 'Status',
    dataIndex: 'status',
  },
  {
    title: 'Enabled',
    dataIndex: 'enabled',
    render: (text, record, index) => (!!record.enabled).toString(),
  },
];

const tableConfig = {
  rowKey: 'bssid',
  pagination: false,
};

const Instance = () => (
  <Consumer>
    {({ wifiEnabled, ssidsLoaded, currentSsids, ssids, slackInstances, setStatus, getConnections, selectedView, removeSlackInstance, configurations }) => {
      const instance = slackInstances.find(({ id }) => id === selectedView);
      const { profile } = instance;

      const statusSet = (profile.status_emoji || profile.status_text);

      const data = ssids
        .map(ssid => ({
          ...ssid,
          ...configurations.find(config => config.instanceId === instance.id && config.bssid === ssid.bssid),
          current: currentSsids.find(cs => cs.bssid === ssid.bssid),
        }))
        .sort((a, b) => a.ssid > b.ssid || (a.ssid === b.ssid && a.bssid > b.bssid));

      return (
        <StyledInstance>
          <Header>
            <Column className={statusSet ? 'end' : 'center'}>
              <Image className="round"><img src={profile.image_48} alt={profile.real_name_normalized} /></Image>
              <div>{profile.real_name_normalized}</div>
            </Column>
            {statusSet && (
              <Column className="start">
                <Emoji emoji={profile.status_emoji} size="large" />
                <div>{profile.status_text}</div>
              </Column>
            )}
          </Header>
          <Content>
            <Table
              {...tableConfig}
              columns={columns}
              dataSource={data}
            />
            <pre style={{ display: 'none' }}>
              {JSON.stringify(instance, null, 2)}
            </pre>
          </Content>
        </StyledInstance>
      );
    }}
  </Consumer>
);

const StyledInstance = styled.div`
  min-width: 100%;
  min-height: 100%;

  & .ant-layout-header {
    display: flex;
    justify-content: space-between;
    background: ${COLOR['white']};
    padding: 0;
    position: fixed;
    width: calc(100% - 200px);
    z-index: 100;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.25);
  }

  & .ant-layout-content {
    margin: ${DIMENSION['1.5x']} ${DIMENSION['1x']} 0;
    overflow: initial;
    margin-top: 70px;
    font-size: ${FONT_SIZE['regular']};
  }

  & .ant-table {
    font-size: ${FONT_SIZE['regular']};
  }
`;
const Image = styled.div`
  &.round img {
    border: ${BORDER['thin']} solid ${COLOR['borderLight']};
    border-radius: 100%;
    margin-right: ${DIMENSION['0.5x']};
  }
`;
const SsidName = styled.div`
  font-weight: ${FONT_WEIGHT['bold']};
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${props => props.current && css`
    color: red;
  `}
`;
const Column = styled.div`
  display: flex;
  flex: 1 1 100%;
  padding: 0 ${DIMENSION['0.75x']};


  &.start {
    justify-content: flex-start;
  }
  &.center {
    justify-content: center;
  }
  &.end {
    justify-content: flex-end;
  }
`;

export default Instance;
