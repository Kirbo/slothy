import React from 'react';
import PropTypes from 'prop-types';

import EmojiElement from './EmojiElement';

import { Consumer } from '../../container/Context/Context';

const Emoji = ({emoji}) => (
  <Consumer>
    {({ slackInstances, currentToken }) => {
      const { emojis } = slackInstances.find(instance => instance.token === currentToken);
      return (
        <EmojiElement emojis={emojis} emoji={emoji} />
      );
    }}
  </Consumer>
);

Emoji.propTypes = {
  emoji: PropTypes.string.isRequired,
};

export default Emoji;
