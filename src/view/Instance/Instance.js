import React from 'react';
import styled, { css } from 'styled-components';
import { Layout } from 'antd';

import Emoji from '../../component/Emoji';
import { Consumer } from '../../container/App/Context';

import { FONT_WEIGHT, BORDER, DIMENSION, COLOR } from '../../assets/css';

const { Header, Content } = Layout;

const Instance = () => (
  <Consumer>
    {({ wifiEnabled, ssidsLoaded, currentSsids, ssids, slackInstances, setStatus, getConnections, selectedView, removeSlackInstance }) => {
      const instance = slackInstances.find(({ id }) => id === selectedView);
      const { token, profile } = instance;

      const statusSet = (profile.status_emoji || profile.status_text);

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
            <button onClick={() => setStatus({ emoji: '', status: '', token })}>Empty status</button>
            <button onClick={() => setStatus({ emoji: ':zany_face:', status: '', token })}>Set status zany</button>
            <button onClick={() => setStatus({ emoji: ':house:', status: 'Kotona', token })}>Set status home</button>
            <button onClick={() => getConnections()} disabled={!ssidsLoaded}>Get Connections</button>
            <button onClick={() => removeSlackInstance(instance.token)}>Delete</button>
            {wifiEnabled
              ? (
                <Ssids>
                  <h1>SSIDS:{!ssidsLoaded && ' (Loading...)'}</h1>
                  {ssids.sort((a, b) => a.ssid > b.ssid || (a.ssid === b.ssid && a.bssid > b.bssid)).map(ssid => (
                    <Ssid key={ssid.bssid}>
                      <SsidName current={currentSsids.find(cs => cs.bssid === ssid.bssid)}>{ssid.ssid}</SsidName>
                      <div>{ssid.bssid}</div>
                      <div>Signal level: <span>{ssid.signal_level}</span></div>
                    </Ssid>
                  ))}
                </Ssids>
              )
              : (
                <div>WiFi not enabled</div>
              )
            }
          </Content>
        </StyledInstance>
      );
    }}
  </Consumer>
);

const StyledInstance = styled.div`
  width: 100%;
  height: 100%;

  & .ant-layout-header {
    display: flex;
    justify-content: space-between;
    background: ${COLOR['white']};
    padding: 0;
  }

  & .ant-layout-content {
    margin: ${DIMENSION['1.5x']} ${DIMENSION['1x']} 0;
    overflow: initial;
  }
`;
const Image = styled.div`
  &.round img {
    border: ${BORDER['thin']} solid ${COLOR['borderLight']};
    border-radius: 100%;
    margin-right: ${DIMENSION['0.5x']};
  }
`;
const Ssids = styled.div``;
const Ssid = styled.div`
  display: flex;
  justify-content: space-between;
`;
const SsidName = styled.div`
  width: 33%;
  font-weight: ${FONT_WEIGHT['bold']};

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
