import React from 'react';
import PropTypes from 'prop-types';
import nodeEmoji from 'node-emoji';
import styled from 'styled-components';

import { FONT_SIZE, DIMENSION } from '../../assets/css';

/**
 * EmojiElement
 * @param {object} props - Properties for the component.
 * @returns {jsx}
 */
const EmojiElement = ({ emoji, emojis, size }) => {
  const strippedEmoji = emoji.replace(/:/g, '');
  let source = emojis[strippedEmoji];

  const regex = new RegExp(/^alias:(.*)/i);
  const matches = regex.exec(source);

  let findAlias;
  if (matches && matches[1]) {
    findAlias = matches[1]; // eslint-disable-line prefer-destructuring
  }

  if (nodeEmoji.hasEmoji(emoji)) {
    return <Span size={size}>{nodeEmoji.get(emoji)}</Span>;
  } else if (findAlias && nodeEmoji.hasEmoji(findAlias)) {
    return <Span size={size}>{nodeEmoji.get(findAlias)}</Span>;
  } else if (matches) {
    source = emojis[matches[1]];

    if (source) {
      return (
        <Img src={source} alt="" size={size} />
      );
    }
  }

  return (
    <Img src={source} alt="" size={size} />
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
  height: ${({ size }) => FONT_SIZE[size]};
`;
const Span = styled.span`
  font-size: ${({ size }) => FONT_SIZE[size]};
  margin-right: ${DIMENSION['0.5x']};
`;

export default EmojiElement;
