import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Icon from '../Icon';

import { openExternal } from '../../assets/utils';
import { COLOR, DIMENSION } from '../../assets/css';

import packageJson from '../../../package.json';

/**
 * Handle click
 */
const handleClick = () => {
  openExternal(`https://slack.com/oauth/authorize?client_id=${packageJson.product.ClientId}&scope=emoji:read,users.profile:read,users.profile:write,team:read`);
};

/**
 * Returns the content for the add instance.
 * @param {object} props - Properties for the component.
 * @returns {jsx}
 */
const content = ({ mode, text, icon }) => {
  const cases = {
    text: () => (
      <StyledText onClick={handleClick}>
        <Icon icon={icon} /> {text}
      </StyledText>
    ),
    default: () => (
      <Button onClick={handleClick}>
        <img
          alt="Sign in with Slack"
          src="images/sign_in_with_slack.png"
          srcSet="images/sign_in_with_slack.png 1x, images/sign_in_with_slack@2x.png 2x"
        />
      </Button>
    ),
  };

  return cases[mode] ? cases[mode]() : cases.default();
};

/**
 * AddInstance component
 * @param {object} props - Properties for the component.
 * @returns {jsx}
 */
const AddInstance = ({ mode, text, icon }) => (
  <Styled>
    {content({
      mode,
      text,
      icon,
    })}
  </Styled>
);

AddInstance.propTypes = {
  mode: PropTypes.oneOf([
    'text',
    'image',
  ]),
  text: PropTypes.string,
  icon: PropTypes.string,
};

AddInstance.defaultProps = {
  mode: 'image',
  text: 'Add new Slack instance',
  icon: 'plus-square',
};

const Styled = styled.div`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  transition: all 0.25s;
  color: ${COLOR.lightGray};

  &:hover {
    color: ${COLOR.white};
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
