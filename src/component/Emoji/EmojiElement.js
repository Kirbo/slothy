import React from 'react';
import PropTypes from 'prop-types';
import emoji from 'node-emoji';
import styled from 'styled-components';

const Img = styled.img``;
const Span = styled.span``;

const EmojiElement = (props) => {
  if (props.emojis && props.emojis !== null) {
    const strippedEmoji = props.emoji.replace(/:/g, '');
    let source = props.emojis[strippedEmoji];

    const regex = new RegExp(/^alias:(.*)/i);
    const matches = regex.exec(source);

    if (matches) {
      source = props.emojis[matches[1]];
    }

    if (source) {
      return (
        <Img src={source} alt="" />
      );
    }
  }

  return <Span>{emoji.get(props.emoji)}</Span>;
};

EmojiElement.propTypes = {
  emojis: PropTypes.instanceOf(Object),
  emoji: PropTypes.string.isRequired,
};

export default EmojiElement;
