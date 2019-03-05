import React from 'react';
import styled, { css } from 'styled-components';

import { Consumer } from '../Context/Context';

import Header from '../../component/Header';
import Instances from '../../component/Instances';

const StyledHome = styled.div`
  width: 100%;
  height: 100%;
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

const Home = () => (
  <Consumer>
    {({ ssidsLoaded, currentSsids, ssids, slackInstances, setStatus, getConnections }) => {
      let token;
      if (slackInstances.length > 0) {
        token = slackInstances[0].token;
      }

      return (
        <StyledHome>
          <Header />
          <button onClick={() => setStatus({ emoji: ':zany_face:', status: '', token })}>Set status zany</button>
          <button onClick={() => setStatus({ emoji: ':house:', status: 'Kotona', token })}>Set status home</button>
          <button onClick={() => getConnections()} disabled={!ssidsLoaded}>Get Connections</button>

          <Instances />

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
        </StyledHome>
      );
    }}
  </Consumer>
);

export default Home;
