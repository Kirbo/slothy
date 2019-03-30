import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

import { Consumer } from '../../container/App/Context';

import { DIMENSION } from '../../assets/css';

const { shell } = window.require('electron');

library.add(fas);
library.add(fab);

const handleClick = () => shell.openExternal("https://slack.com/oauth/authorize?client_id=328708589652.565337016417&scope=emoji:read,users.profile:read,users.profile:write,team:read");

const content = ({ mode, text, icon }) => {
  switch (mode) {
    case 'text': {
      return (
        <StyledText onClick={handleClick}>
          <FAIcon icon={icon} /> {text}
        </StyledText>
      );
    }
    default: {
      return (
        <Button onClick={handleClick}>
          <img alt="Sign in with Slack" src="images/sign_in_with_slack.png" srcSet="images/sign_in_with_slack.png 1x, images/sign_in_with_slack@2x.png 2x" />
        </Button>
      );
    }
  }
}

const AddInstance = (props) => (
  <Consumer>
    {() => (
      <Styled>
        {content(props)}
      </Styled>
    )}
  </Consumer>
);

AddInstance.propTypes = {
  mode: PropTypes.oneOf([
    'text',
    'image',
  ]),
  text: PropTypes.string,
}

AddInstance.defaultProps = {
  mode: 'image',
  text: 'Add new Slack instance',
  icon: 'plus-square',
}

const Styled = styled.div`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  color: #fff;
  & > * {
    cursor: pointer;
  }
`;
const Button = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
`;
const StyledText = styled.div`
  display: flex;
  width: 100%;
  padding: ${DIMENSION['0.75x']} ${DIMENSION['0.5x']};
  align-items: center;
  justify-content: center;

  & svg {
    margin-right: ${DIMENSION['0.5x']};
  }
`;

export default AddInstance;
