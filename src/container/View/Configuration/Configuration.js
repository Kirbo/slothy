import React from 'react';
import { Layout, Table } from 'antd';

import { Consumer } from '../../App/Context';

import ModifyConfiguration from '../../../component/ModifyConfiguration';

import { Styled } from '../Instance/Instance';
import { tableConfig, configurationsColumns } from '../Instance/InstanceConfig';

const { Header, Content } = Layout;

const Configuration = () => (
  <Consumer>
    {({ configurations, viewType, selectedView, slackInstances, currentSsids }) => {
      const dataSource = configurations.map(config => ({
        key: config.id,
        ssid: config.ssid,
        bssid: config.bssid,
        connected: !!currentSsids.find(ssid => config.bssid === ssid.bssid || config.ssid === ssid.ssid),
        instanceId: config.instanceId,
        config,
      }));

      return (
        <Styled>
          <Header>
            Configurations
          </Header>
          <Content>
            <Table
              {...tableConfig}
              columns={configurationsColumns(slackInstances)}
              dataSource={dataSource}
            />
            <ModifyConfiguration />
          </Content>
        </Styled>
      );
    }}
  </Consumer>
);

export default Configuration;
