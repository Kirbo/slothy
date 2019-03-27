import React from 'react';
import PropTypes from 'prop-types';
import emoji from 'node-emoji';
import styled from 'styled-components';

import { FONT_SIZE, DIMENSION } from '../../assets/css';

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
        <Img src={source} alt="" size={props.size} />
      );
    }
  }

  return <Span size={props.size}>{emoji.get(props.emoji)}</Span>;
};

EmojiElement.propTypes = {
  emojis: PropTypes.instanceOf(Object),
  emoji: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.keys(FONT_SIZE)),
};

EmojiElement.defaultProps = {
  size: 'medium',
};

const Img = styled.img``;
const Span = styled.span`
  font-size: ${({ size }) => FONT_SIZE[size]};
  margin-right: ${DIMENSION['0.5x']};
`;

export default EmojiElement;
