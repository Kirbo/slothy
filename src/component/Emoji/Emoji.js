import React from 'react';
import PropTypes from 'prop-types';

import EmojiElement from './EmojiElement';

import { FONT_SIZE } from '../../assets/css';
import { Consumer } from '../../container/App/Context';

/**
 * Emoji
 * @param {object} props - Properties for the component.
 * @returns {jsx}
 */
const Emoji = ({ emoji, size, slackInstanceId }) => (
  <Consumer>
    {({ slackInstances, selectedView }) => (
      <EmojiElement
        emojis={
          (
            slackInstances.find(({ id }) => (
              (slackInstanceId && id === slackInstanceId)
              || (selectedView && id === selectedView)
            ))
            || {
              emojis: [],
            }
          ).emojis
        }
        emoji={emoji}
        size={size}
      />
    )}
  </Consumer>
);

Emoji.propTypes = {
  emoji: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.keys(FONT_SIZE)),
  slackInstanceId: PropTypes.string,
};

Emoji.defaultProps = {
  size: 'm',
  slackInstanceId: null,
};

export default Emoji;
