import React from 'react';
import styled from 'styled-components';
import { Empty, Button } from 'antd';

import { Consumer } from '../../container/App/Context';


const NoConnections = () => (
  <Consumer>
    {({ getConnections, ssidsLoaded }) => (
      <Styled>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              No connections found.<br />
              Is Wi-Fi enabled?
            </span>
          }>
          <Button
            onClick={getConnections}
            loading={!ssidsLoaded}
            disabled={!ssidsLoaded}
          >
            Reload
          </Button>
        </Empty>
      </Styled>
    )}
  </Consumer>
)

const Styled = styled.div``;

export default NoConnections
