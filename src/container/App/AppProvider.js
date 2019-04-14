import React, { Component } from 'react';

import INITIAL_STATE from './InitialState';
import { Provider } from './Context';
import Loading from '../Loading';

import { sortBy } from '../../assets/utils';

const electron = window.require('electron');
const { ipcRenderer } = electron;

let connectionsTimeout;

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
      clearTimeout(connectionsTimeout);
      this.state.setProperty({ ssidsLoaded: false });
      ipcRenderer.send('getConnections');
    },
    setStatus: ({ emoji, status, token }) => {
      ipcRenderer.send('setStatus', { emoji, status, token });
    },
    selectView: ({ key, item }) => {
      const { type } = item.props;
      this.state.setProperty({
        viewType: type,
        selectedView: key,
      });
    },
    handleExpand: (expanded, record) => {
      if (expanded) {
        this.state.setProperty({
          expandedRowKeys: [
            ...this.state.expandedRowKeys,
            record.key,
          ],
        });
      } else {
        this.state.setProperty({
          expandedRowKeys: this.state.expandedRowKeys.filter(key => key !== record.key),
        });
      }
    },
    modifyConfiguration: (record) => {
      this.state.setProperty({
        drawerConfig: record,
      });
    },
  };

  componentDidMount = () => {
    ipcRenderer.send('initialize');

    const setConnectionsTimeout = () => {
      clearTimeout(connectionsTimeout);
      connectionsTimeout = setTimeout(() => {
        this.state.getConnections();
      }, 30 * 1000);
    }

    ipcRenderer.on('connections', (event, { ssids, currentSsids }) => {
      setConnectionsTimeout();
      this.state.setProperty({
        ssids: !!this.state.ssids.length && !ssids.length ? this.state.ssids : ssids,
        currentSsids,
        wifiEnabled: !!ssids.length || !!currentSsids.length,
        ssidsLoaded: true,
      });
    });

    ipcRenderer.on('configurations', (event, configurations) => {
      this.state.setProperty({ configurations });
    });

    ipcRenderer.on('slackInstances', (event, slackInstances) => {
      let { viewType, selectedView } = this.state;

      if (
        (viewType === 'instance' && !selectedView && slackInstances.length)
        || (viewType === 'instance' && selectedView && slackInstances.length && !slackInstances.find(({ id }) => id === this.state.selectedView))
      ) {
        selectedView = slackInstances.sort(sortBy('name'))[0].id;
      }

      this.state.setProperty({
        slackInstancesLoaded: true,
        slackInstances,
        selectedView,
      });
    });

    ipcRenderer.on('newSlackInsatance', (event, slackInstance) => {
      console.log('slackInstance', slackInstance);
    });
  };

  componentWillUnmount = () => {
    clearTimeout(connectionsTimeout);

    [
      'connections',
      'configurations',
      'slackInstances',
      'newSlackInsatance',
      'wifiStatus',
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
          connected={this.state.connected}
        />
      )}
      <Provider value={this.state}>{this.props.children}</Provider>
    </React.Fragment>
  )
}

export default AppProvider;
