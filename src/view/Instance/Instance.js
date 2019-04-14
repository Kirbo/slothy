import React from 'react';
import styled from 'styled-components';
import { Layout, Table, Button } from 'antd';

import ModifyConfiguration from '../../component/ModifyConfiguration';
import Emoji from '../../component/Emoji';
import NoConnections from '../../component/NoConnections';
import { Consumer } from '../../container/App/Context';

import { columns, nestedColumns, tableConfig } from './InstanceConfig';

import { FONT_SIZE, BORDER, DIMENSION, COLOR } from '../../assets/css';

const { Header, Content } = Layout;

const Instance = () => (
  <Consumer>
    {({ wifiEnabled, ssidsLoaded, currentSsids, ssids, slackInstances, setStatus, getConnections, selectedView, removeSlackInstance, configurations, expandedRowKeys, handleExpand }) => {
      const instance = slackInstances.find(({ id }) => id === selectedView);
      const { profile } = instance;

      const statusSet = (profile.status_emoji || profile.status_text);

      const sortAndFindConfig = (array, findConfigBy) => (
        array
          .map(ssid => ({
            config: (configurations
              .filter(config => !!config[findConfigBy])
              .find(config =>
                config.instanceId.toUpperCase() === instance.id.toUpperCase()
                && ssid[findConfigBy]
                && config[findConfigBy].toUpperCase() === ssid[findConfigBy].toUpperCase()
              ) || null),
            ...ssid,
            ...((ssid.accessPoints && { accessPoints: sortAndFindConfig(ssid.accessPoints, 'bssid') }) || {}),
          })
          )
          .sort((a, b) => {
            if (a.connected > b.connected) {
              return -1;
            } else if (a.ssid < b.ssid) {
              return -1;
            } else if (a.ssid > b.ssid) {
              return 1;
            } else if (a.ssid === b.ssid && a.bssid > b.bssid) {
              return 1;
            } else if (a.ssid === b.ssid && a.bssid < b.bssid) {
              return -1;
            }
            return 0;
          })
      )

      const data = sortAndFindConfig(ssids, 'ssid');

      const expandedRowRender = (record, index, indent, expanded) => {
        return (
          <Table
            {...tableConfig}
            columns={nestedColumns}
            dataSource={record.accessPoints}
          />
        );
      };

      return (
        <StyledInstance>
          <Header>
            <Column className={statusSet ? 'end' : 'center'}>
              <Image className="round"><img src={profile.image_48} alt={profile.real_name_normalized} /></Image>
              <div>{profile.real_name_normalized}</div>
            </Column>
            {statusSet && (
              <Column className="start">
                <Emoji emoji={profile.status_emoji} size="xl" />
                <div>{profile.status_text}</div>
              </Column>
            )}
          </Header>
          <Content>
            <Table
              {...tableConfig}
              columns={columns}
              dataSource={data}
              expandedRowKeys={expandedRowKeys}
              onExpand={handleExpand}
              expandedRowRender={expandedRowRender}
              locale={{
                emptyText: <NoConnections />
              }}
            />
            <Centered>
              <Button
                onClick={getConnections}
                loading={!ssidsLoaded}
                disabled={!ssidsLoaded}
                icon="reload"
              >
                Reload
              </Button>
            </Centered>
            <ModifyConfiguration />
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
    box-shadow: 0 ${DIMENSION['0.125x']} ${DIMENSION['0.75x']} rgba(0, 0, 0, 0.25);
  }

  & .ant-layout-content {
    margin: ${DIMENSION['1.5x']} ${DIMENSION['1x']} 0;
    overflow: initial;
    margin-top: ${DIMENSION['5x']};
    font-size: ${FONT_SIZE['regular']};
  }

  & .ant-table {
    font-size: ${FONT_SIZE['regular']};

    & .bssid {
      text-transform: uppercase;
    }
    & tr {
      & td {
        height: ${DIMENSION['4x']};
      }
      & .emoji {
        width: ${DIMENSION['5x']};
        max-width: ${DIMENSION['5x']};
        min-width: ${DIMENSION['5x']};
        text-align: center;

        & span {
          margin: 0;
        }
      }
      & .status {
        width: ${DIMENSION['10x']};
        max-width: ${DIMENSION['10x']};
        min-width: ${DIMENSION['10x']};
      }
      & .enabled {
        width: ${DIMENSION['6x']};
        max-width: ${DIMENSION['6x']};
        min-width: ${DIMENSION['6x']};
        text-align: center;
      }
      & .setup {
        width: ${DIMENSION['6x']};
        max-width: ${DIMENSION['6x']};
        min-width: ${DIMENSION['6x']};
        text-align: center;
      }

      &.config-enabled td.enabled svg {
        color: ${COLOR['enabled']};
      }

      &.config-disabled td.enabled svg {
        color: ${COLOR['disabled']};
      }
    }
  }
`;

const Centered = styled.div`
  display: flex;
  flex: 1 1 100%;
  justify-content: center;
  margin: ${DIMENSION['1x']} 0;
  width: calc(100vw - 200px);
  position: absolute;
`;
const Image = styled.div`
  &.round img {
    border: ${BORDER['thin']} solid ${COLOR['borderLight']};
    border-radius: 100%;
    margin-right: ${DIMENSION['0.5x']};
  }
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
