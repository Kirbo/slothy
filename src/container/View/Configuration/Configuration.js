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
      const connectedBssids = currentSsids.map(({ bssid }) => bssid.toUpperCase());
      const bssidConfigurations = configurations.filter(({ bssid }) => bssid && connectedBssids.includes(bssid.toUpperCase()));

      const connectedSsids = currentSsids.map(({ ssid }) => ssid.toUpperCase());
      const ssidConfigurations = configurations.filter(({ bssid, instanceId, ssid }) => {
        if (bssid && connectedBssids.includes(bssid.toUpperCase()) && !bssidConfigurations.find(config => instanceId === config.instanceId && config.bssid.toUpperCase() === bssid.toUpperCase())) {
          return true;
        } else if (!bssid && !bssidConfigurations.find(config => instanceId === config.instanceId && config.ssid.toUpperCase() === ssid.toUpperCase()) && connectedSsids.includes(ssid.toUpperCase())) {
          return true;
        }

        return false;
      });

      const connectedConfigurations = [
        ...bssidConfigurations.map(({ id }) => id),
        ...ssidConfigurations.map(({ id }) => id),
      ];

      const dataSource = configurations
        .map(config => {
          const instance = slackInstances.find(({ id }) => id === config.instanceId) || {
            name: 'Unkown - deleted?'
          };
          return {
            key: config.id,
            slackInstanceName: instance.name,
            ssid: config.ssid,
            bssid: config.bssid,
            connected: connectedConfigurations.includes(config.id),
            instanceId: config.instanceId,
            config,
          };
        })
        .sort((a, b) => {
          if (a.slackInstanceName < b.slackInstanceName) {
            return -1;
          } else if (a.slackInstanceName > b.slackInstanceName) {
            return 1;
          } else if (a.slackInstanceName === b.slackInstanceName && a.ssid < b.ssid) {
            return -1;
          } else if (a.slackInstanceName === b.slackInstanceName && a.ssid > b.ssid) {
            return 1;
          } else if (a.slackInstanceName === b.slackInstanceName && a.ssid === b.ssid && a.bssid < b.bssid) {
            return -1;
          } else if (a.slackInstanceName === b.slackInstanceName && a.ssid === b.ssid && a.bssid > b.bssid) {
            return 1;
          }
          return 0;
        });

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
