import React from 'react';
import styled from 'styled-components';
import { Empty } from 'antd';

import { Consumer } from '../../container/App/Context';

/**
 * NoConnections
 * @returns {jsx}
 */
const NoConnections = () => (
  <Consumer>
    {() => (
      <Styled>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={(
            <span>
              No connections found.
              <br />
              Is Wi-Fi enabled?
            </span>
          )}
        />
      </Styled>
    )}
  </Consumer>
);

const Styled = styled.div``;

export default NoConnections;
