import React from 'react';
import styled from 'styled-components';

import { Consumer } from '../../container/App/Context';

import { COLOR } from '../../assets/css';

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
)

const Styled = styled.a`
  color: ${({ existing }) => existing ? COLOR['red'] : COLOR['lightGray']};
`;

export default ModifyButton;
