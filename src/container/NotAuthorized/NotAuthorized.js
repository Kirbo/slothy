import React from 'react';
import styled from 'styled-components';

import { Consumer } from '../Context/Context';
import AddInstance from '../../component/AddInstance';

const NotAuthorized = () => (
  <Consumer>
    {(context) => {
      return (
        <Styled>
          <h2>
            You have not authorized Sloth in any of your Slack instances.
          </h2>
          <AddInstance />
        </Styled>
      )
    }}
  </Consumer>
);

const Styled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default NotAuthorized;
