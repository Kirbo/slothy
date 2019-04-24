import React from 'react';
import styled from 'styled-components';
import { Layout, Table, Button } from 'antd';

import { Consumer } from '../../App/Context';

import ModifyConfiguration from '../../../component/ModifyConfiguration';
import Emoji from '../../../component/Emoji';
import NoConnections from '../../../component/NoConnections';
import { FONT_SIZE, BORDER, DIMENSION, COLOR } from '../../../assets/css';

import { columns, nestedColumns, tableConfig } from './InstanceConfig';

const { Header, Content } = Layout;

const Instance = () => (
  <Consumer>
    {({ wifiEnabled, ssidsLoaded, currentSsids, ssids, slackInstances, setStatus, getConnections, selectedView, removeSlackInstance, configurations, expandedRowKeys, handleExpand, saveConfiguration }) => {
      const instance = slackInstances.find(({ id }) => id === selectedView);
      const { id, profile } = instance;

      const statusSet = (profile.status_emoji || profile.status_text);

      const sortAndFindConfig = (array, findConfigBy) => (
        array
          .map(ssid => ({
            instanceId: id,
            config: (configurations
              .filter(config => !!config[findConfigBy])
              .find(config =>
                config.instanceId.toUpperCase() === instance.id.toUpperCase()
                && ssid[findConfigBy]
                && config[findConfigBy].toUpperCase() === ssid[findConfigBy].toUpperCase()
              ) || { emoji: '', status: '' }),
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
            columns={nestedColumns(saveConfiguration)}
            dataSource={record.accessPoints}
          />
        );
      };

      return (
        <Styled>
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
              columns={columns(saveConfiguration)}
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
        </Styled>
      );
    }}
  </Consumer>
);

const HeaderHeight = DIMENSION['5x'];
const ContentTopMargin = `calc(${HeaderHeight} + ${DIMENSION['1x']})`;

export const Styled = styled.div`
  min-width: 100%;
  min-height: 100%;

  & .ant-layout-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: ${COLOR['white']};
    padding: 0;
    position: fixed;
    width: calc(100% - 200px);
    height: ${HeaderHeight};
    min-height: ${HeaderHeight};
    max-height: ${HeaderHeight};
    z-index: 99;
    box-shadow: 0 ${DIMENSION['0.125x']} ${DIMENSION['0.75x']} rgba(0, 0, 0, 0.25);
  }

  & .ant-layout-content {
    margin: ${DIMENSION['1.5x']} ${DIMENSION['1x']};
    overflow: initial;
    margin-top: ${ContentTopMargin};
    font-size: ${FONT_SIZE['regular']};
  }

  & .ant-table {
    font-size: ${FONT_SIZE['regular']};
    max-width: 100%;
    min-width: 100%;

    & .bssid {
      text-transform: uppercase;
    }
    & tr {
      & td {
        height: ${DIMENSION['4x']};
      }
      & .slack {
        max-width: ${DIMENSION['4x']};
      }
      & .ssid {
        max-width: ${DIMENSION['6x']};
      }
      & .bssid {
        max-width: ${DIMENSION['6x']};
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
