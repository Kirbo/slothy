import React from 'react';
import PropTypes from 'prop-types';

import EmojiElement from './EmojiElement';

import { Consumer } from '../../container/App/Context';

const Emoji = ({ emoji, size = 'm', slackInstanceId = null }) => (
  <Consumer>
    {({ slackInstances, selectedView }) => (
      <EmojiElement
        emojis={
          (slackInstances.find(({ id }) => (
            (slackInstanceId && id === slackInstanceId)
            || (selectedView && id === selectedView)
          )) || { emojis: [] }).emojis
        }
        emoji={emoji}
        size={size}
      />
    )}
  </Consumer>
);

Emoji.propTypes = {
  emoji: PropTypes.string.isRequired,
};

export default Emoji;
