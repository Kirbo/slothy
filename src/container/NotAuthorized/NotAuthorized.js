import React from 'react';
import styled from 'styled-components';

import { Consumer } from '..//Context/Context';

const { shell } = window.require('electron');

const Styled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Button = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
`;

const NotAuthorized = () => (
  <Consumer>
    {(context) => {
      return (
        <Styled>
          <h2>
            You have not authorized Sloth in any of your Slack instances.
          </h2>
          <Button onClick={() => shell.openExternal("https://slack.com/oauth/authorize?client_id=328708589652.565337016417&scope=emoji:read,users.profile:read,users.profile:write,team:read")}>
            <img alt="Sign in with Slack" src="images/sign_in_with_slack.png" srcSet="images/sign_in_with_slack.png 1x, images/sign_in_with_slack@2x.png 2x" />
          </Button>
        </Styled>
      )
    }}
  </Consumer>
);

export default NotAuthorized;
