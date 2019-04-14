import React from 'react';
import PropTypes from 'prop-types';
import emoji from 'node-emoji';
import styled from 'styled-components';

import { FONT_SIZE, DIMENSION } from '../../assets/css';

const EmojiElement = (props) => {
  const strippedEmoji = props.emoji.replace(/:/g, '');
  let source = props.emojis[strippedEmoji];

  const regex = new RegExp(/^alias:(.*)/i);
  const matches = regex.exec(source);

  let findAlias;
  if (matches && matches[1]) {
    findAlias = matches[1];
  }

  if (emoji.hasEmoji(props.emoji)) {
    return <Span size={props.size}>{emoji.get(props.emoji)}</Span>;
  } else if (findAlias && emoji.hasEmoji(findAlias)) {
    return <Span size={props.size}>{emoji.get(findAlias)}</Span>;
  } else if (matches) {
    source = props.emojis[matches[1]];

    if (source) {
      return (
        <Img src={source} alt="" size={props.size} />
      );
    }
  }

  return (
    <Img src={source} alt="" size={props.size} />
  );
};

EmojiElement.propTypes = {
  emoji: PropTypes.string.isRequired,
  emojis: PropTypes.instanceOf(Object),
  size: PropTypes.oneOf(Object.keys(FONT_SIZE)),
};

EmojiElement.defaultProps = {
  emojis: [],
  size: 'm',
};

const Img = styled.img`
  width: ${({ size }) => FONT_SIZE[size]};
`;
const Span = styled.span`
  font-size: ${({ size }) => FONT_SIZE[size]};
  margin-right: ${DIMENSION['0.5x']};
`;

export default EmojiElement;
