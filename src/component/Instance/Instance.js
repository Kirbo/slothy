import React from 'react';
import styled, { css } from 'styled-components';
import { Layout } from 'antd';

import EmojiElement from '../Emoji/EmojiElement';
import { Consumer } from '../../container/Context/Context';

import { FONT_WEIGHT, BORDER, DIMENSION, COLORS } from '../../assets/css';

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
            <Column className="end">
              <Image className="round"><img src={instance.profile.image_48} alt={instance.profile.real_name_normalized} /></Image>
              <div>{instance.profile.real_name_normalized}</div>
            </Column>
            <Column className="start">
              <EmojiElement emoji={instance.profile.status_emoji} size="large" />
              <div>{instance.profile.status_text}</div>
            </Column>
          </Header>
          <Content style={{ margin: '1.5rem 1rem 0', overflow: 'initial' }}>
            <button onClick={() => setStatus({ emoji: ':zany_face:', status: '', token })}>Set status zany</button>
            <button onClick={() => setStatus({ emoji: ':house:', status: 'Kotona', token })}>Set status home</button>
            <button onClick={() => getConnections()} disabled={!ssidsLoaded}>Get Connections</button>
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
            Kimmo Saari © 2019
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
    justify-content: space-between;
  }
`;
const Image = styled.div`
  &.round img {
    border: ${BORDER['thin']} solid ${COLORS['border']};
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
