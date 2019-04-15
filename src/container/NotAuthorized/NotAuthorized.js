import React from 'react';
import styled from 'styled-components';

import { Consumer } from '../App/Context';
import AddInstance from '../../component/AddInstance';

const NotAuthorized = () => (
  <Consumer>
    {() => (
      <Styled>
        <h2>
          You have not authorized Slacky in any of your Slack instances, yet.
        </h2>
        <AddInstance />
      </Styled>
    )}
  </Consumer>
);

const Styled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default NotAuthorized;
