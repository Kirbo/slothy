import React, { Component } from 'react';
// import slack from 'slack';

import INITIAL_STATE from './InitialState';
import { Provider } from './Context';

const electron = window.require('electron');
const { ipcRenderer } = electron;

class AppProvider extends Component {
  state = {
    ...INITIAL_STATE,
    removeSlackInstance: (token) => {
      ipcRenderer.send('removeSlackInstance', { token });
    },
    getConnections: () => {
      this.setState(prevState => ({
        ...prevState,
        ssidsLoaded: false,
      }));
      ipcRenderer.send('getConnections');
    },
    setStatus: ({ emoji, status, token }) => {
      ipcRenderer.send('setStatus', { emoji, status, token });
    },
  };

  componentWillMount = () => {
    ipcRenderer.send('initialize');

    ipcRenderer.on('connections', (event, { ssids, currentSsids }) => {
      this.setState(prevState => ({
        ...prevState,
        ssids,
        currentSsids,
        ssidsLoaded: true,
      }));
    });

    ipcRenderer.on('slackInstances', (event, slackInstances) => {
      this.setState(prevState => ({
        ...prevState,
        slackInstances,
        slackInstancesLoaded: true,
      }));
    });
  };

  render = () => {
    if (!this.state.slackInstancesLoaded) {
      return <React.Fragment>Loading...</React.Fragment>;
    }

    return <Provider value={this.state}>{this.props.children}</Provider>;
  };
}

export default AppProvider;
