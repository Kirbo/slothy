import React from 'react';
import styled from 'styled-components';

import EmojiElement from '../Emoji/EmojiElement';

import { Consumer } from '../../container/Context/Context';

const Instance = styled.div`
  display: flex;
  justify-content: space-between;

`;
const InstanceName = styled.div`
  font-weight: bold;
`;
const Instances = () => (
  <Consumer>
    {({ slackInstances, removeSlackInstance }) => {
      return (
        <React.Fragment>
          {slackInstances.sort((a, b) => a.name > b.name).map(instance => (
            <Instance key={instance.name}>
              <img src={instance.icon.image_44} alt={instance.name} />
              <InstanceName>{instance.name}</InstanceName>
              <div>Emoji: <span><EmojiElement emoji={instance.profile.status_emoji} /></span></div>
              <div>Status: <span>{instance.profile.status_text}</span></div>
              <button onClick={() => removeSlackInstance(instance.token)}>Delete</button>
            </Instance>
          ))}
        </React.Fragment>
      );
    }}
  </Consumer>
);

export default Instances;
