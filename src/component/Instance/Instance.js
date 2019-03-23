import React from 'react';
import styled, { css } from 'styled-components';
import { Layout } from 'antd';

import EmojiElement from '../Emoji/EmojiElement';
import { Consumer } from '../../container/Context/Context';

const {
  Header, Content, Footer,
} = Layout;

const Instance = () => (
  <Consumer>
    {({ ssidsLoaded, currentSsids, ssids, slackInstances, setStatus, getConnections, selectedInstance, removeSlackInstance }) => {
      const instance = slackInstances.find(({ id }) => id === selectedInstance);
      const token = instance.token;

      return (
        <StyledInstance>
          <Header style={{ background: '#fff', padding: 0 }}>
            <Image><img src={instance.icon.image_44} alt={instance.name} /></Image>
            <InstanceName>{instance.name}</InstanceName>
          </Header>
          <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <button onClick={() => setStatus({ emoji: ':zany_face:', status: '', token })}>Set status zany</button>
            <button onClick={() => setStatus({ emoji: ':house:', status: 'Kotona', token })}>Set status home</button>
            <button onClick={() => getConnections()} disabled={!ssidsLoaded}>Get Connections</button>
            <div>Emoji: <span><EmojiElement emoji={instance.profile.status_emoji} /></span></div>
            <div>Status: <span>{instance.profile.status_text}</span></div>
            <button onClick={() => removeSlackInstance(instance.token)}>Delete</button>
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
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Footer
          </Footer>
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
  }
`;
const Image = styled.div`
`;
const InstanceName = styled.div`
`;
const Ssids = styled.div``;
const Ssid = styled.div`
  display: flex;
  justify-content: space-between;
`;
const SsidName = styled.div`
  width: 33%;
  font-weight: bold;

  ${props => props.current && css`
    color: red;
  `}
`;

export default Instance;
