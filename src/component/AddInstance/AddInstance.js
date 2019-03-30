import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Icon from '../Icon';

import { openExternal } from '../../assets/utils';
import { COLOR, DIMENSION } from '../../assets/css';

const handleClick = () => {
  openExternal('https://slack.com/oauth/authorize?client_id=328708589652.565337016417&scope=emoji:read,users.profile:read,users.profile:write,team:read');
};

const content = ({ mode, text, icon }) => {
  switch (mode) {
    case 'text': {
      return (
        <StyledText onClick={handleClick}>
          <Icon icon={icon} /> {text}
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
  <Styled>
    {content(props)}
  </Styled>
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
  transition: all 0.25s;
  color: ${COLOR['lightGray']};

  &:hover {
    color: ${COLOR['white']};
  }

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
