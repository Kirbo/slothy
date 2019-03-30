import React from 'react';

import { Consumer } from '../../container/App/Context';

const Configuration = () => (
  <Consumer>
    {({ configurations, viewType, selectedView }) => (
      <div>
        <p>viewType: {viewType}</p>
        <p>selectedView: {selectedView}</p>
        <p>configurations: <pre>{JSON.stringify(configurations)}</pre></p>
      </div>
    )}
  </Consumer>
);

export default Configuration;
