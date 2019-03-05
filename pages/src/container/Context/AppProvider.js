import React, { Component } from 'react';

import INITIAL_STATE from './InitialState';
import { Provider } from './Context';

class AppProvider extends Component {
  state = {
    ...INITIAL_STATE,
  };

  render = () => (
    <Provider value={this.state}>{this.props.children}</Provider>
  );
}

export default AppProvider;
