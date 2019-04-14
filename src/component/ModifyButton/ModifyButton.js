import React from 'react';
import styled from 'styled-components';

import { Consumer } from '../../container/App/Context';

import { COLOR } from '../../assets/css';

const ModifyButton = ({ record }) => (
  <Consumer>
    {({ modifyConfiguration }) => (
      <Styled
        onClick={() => modifyConfiguration(record)}
        configuration={record.config}
      >
        {record.config ? 'Modify' : 'Add'}
      </Styled>
    )}
  </Consumer>
)

const Styled = styled.a`
  color: ${({ configuration }) => configuration ? COLOR['red'] : COLOR['lightGray']};
`;

export default ModifyButton;