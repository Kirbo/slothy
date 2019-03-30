import React, { Component } from 'react';

import INITIAL_STATE from './InitialState';
import { Provider } from './Context';
import Loading from '../Loading';

import { sortBy } from '../../assets/utils';

const electron = window.require('electron');
const { ipcRenderer } = electron;

class AppProvider extends Component {
  state = {
    ...INITIAL_STATE,
    removeSlackInstance: (token) => {
      ipcRenderer.send('removeSlackInstance', { token });
    },
    setProperty: (newState) => {
      this.setState(prevState => ({
        ...prevState,
        ...newState,
      }));
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
    selectView: ({ key, item }) => {
      const { type } = item.props;
      this.setState(prevState => ({
        ...prevState,
        viewType: type,
        selectedView: key,
      }));
    },
  };

  componentDidMount = () => {
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
      let { viewType, selectedView } = this.state;

      if (
        (viewType === 'instance' && !selectedView && slackInstances.length)
        || (viewType === 'instance' && selectedView && slackInstances.length && !slackInstances.find(({ id }) => id === this.state.selectedView))
      ) {
        selectedView = slackInstances.sort(sortBy('name'))[0].id;
      }

      this.setState(prevState => ({
        ...prevState,
        slackInstancesLoaded: true,
        slackInstances,
        selectedView,
      }));
    });

    ipcRenderer.on('newSlackInsatance', (event, slackInstance) => {
      console.log('slackInstance', slackInstance);
    });
  };

  componentWillUnmount = () => {
    [
      'connections',
      'slackInstances',
      'newSlackInsatance',
    ].forEach(channel => {
      ipcRenderer.removeAllListeners(channel);
    });
  }

  render = () => (
    <React.Fragment>
      {this.state.showLoading && (
        <Loading
          slackInstancesLoaded={this.state.slackInstancesLoaded}
          hideLoading={this.state.hideLoading}
          setProperty={this.state.setProperty}
        />
      )}
      <Provider value={this.state}>{this.props.children}</Provider>
    </React.Fragment>
  )
}

export default AppProvider;
