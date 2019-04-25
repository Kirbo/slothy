import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Consumer } from '../../container/App/Context';

import { COLOR } from '../../assets/css';

/**
 * ModifyButton
 * @param {object} props - Properties for the component.
 * @returns {jsx}
 */
const ModifyButton = ({ record }) => (
  <Consumer>
    {({ modifyConfiguration }) => (
      <Styled
        onClick={() => modifyConfiguration(record)}
        existing={record.config.id}
      >
        {record && record.config && record.config.id ? 'Modify' : 'Add'}
      </Styled>
    )}
  </Consumer>
);

ModifyButton.propTypes = {
  record: PropTypes.object.isRequired,
};

const Styled = styled.a`
  color: ${({ existing }) => (existing ? COLOR.red : COLOR.lightGray)};
`;

export default ModifyButton;
