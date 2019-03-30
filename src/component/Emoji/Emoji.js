import React from 'react';
import PropTypes from 'prop-types';

import EmojiElement from './EmojiElement';

import { Consumer } from '../../container/App/Context';

const Emoji = ({ emoji, size = 'medium' }) => (
  <Consumer>
    {({ slackInstances, selectedView }) => {
      const { emojis } = slackInstances.find(({ id }) => id === selectedView);
      return (
        <EmojiElement emojis={emojis} emoji={emoji} size={size} />
      );
    }}
  </Consumer>
);

Emoji.propTypes = {
  emoji: PropTypes.string.isRequired,
};

export default Emoji;
