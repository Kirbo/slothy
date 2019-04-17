import React, { Component } from 'react';
import { message } from 'antd';

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
    removeSlackInstance: token => {
      ipcRenderer.send('removeSlackInstance', { token });
    },
    setProperty: newState => {
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
    modifyConfiguration: record => {
      this.state.setProperty({
        drawerConfig: record,
        drawerVisible: true,
      });
    },
    saveConfiguration: configuration => {
      this.state.setProperty({
        savingConfiguration: true,
        searchEmoji: '',
      });
      ipcRenderer.send('saveConfiguration', configuration);
    },
    removeConfiguration: id => {
      this.state.setProperty({
        removingConfiguration: true,
      });
      ipcRenderer.send('removeConfiguration', { id });
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
    ipcRenderer.on('info', (event, message) => {
      message.info(message);
    });

    ipcRenderer.on('savedConfiguration', (event, value) => {
      this.state.setProperty({
        savingConfiguration: value,
        drawerVisible: false,
      });
      message.success('Configuration succesfully saved.');
    });
    ipcRenderer.on('removedConfiguration', (event, value) => {
      this.state.setProperty({
        removingConfiguration: value,
        drawerVisible: false,
      });
      message.success('Configuration succesfully removed.');
    });

    ipcRenderer.on('success', (event, data) => {
      console.log('success', data);
      message.success(data);
    });
    ipcRenderer.on('error', (event, data) => {
      console.log('error', data);
      message.error(data);
    });
    ipcRenderer.on('info', (event, data) => {
      console.log('info', data);
      message.info(data);
    });
    ipcRenderer.on('warning', (event, data) => {
      console.log('warning', data);
      message.warn(data);
    });
    ipcRenderer.on('loading', (event, data) => {
      console.log('loading', data);
      message.loading(data);
    });

    ipcRenderer.on('newSlackInstance', (event, data) => {});
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
  };

  componentWillUnmount = () => {
    clearTimeout(connectionsTimeout);

    [
      'connections',
      'configurations',
      'slackInstances',
      'newSlackInstance',
      'wifiStatus',
      'savedConfiguration',
      'removedConfiguration',
      'success',
      'error',
      'info',
      'warning',
      'loading',
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
