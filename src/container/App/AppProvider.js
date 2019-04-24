import React, { Component } from 'react';
import { message, notification, Button, Progress } from 'antd';
import uuid from 'uuid/v4';

import INITIAL_STATE from './InitialState';
import { Provider } from './Context';
import Loading from '../Loading';

import { sortBy } from '../../assets/utils';

const electron = window.require('electron');
const { ipcRenderer } = electron;

let connectionsTimeout;

const notifications = [
  'update-notification',
  'update-progress',
  'update-downloaded',
  'update-cancelled',
];

const closeOtherNotifications = (skip = '') => {
  notifications
    .filter(key => key !== skip)
    .forEach(key => {
      notification.close(key);
    })
}

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
        drawerConfig: {
          ...record,
          config: {
            ...record.config,
            instanceId: record.instanceId,
            id: record.config.id || uuid(),
          }
        },
        drawerVisible: true,
      });
    },
    saveConfiguration: (configuration, updateNow = true) => {
      this.state.setProperty({
        savingConfiguration: true,
        searchEmoji: '',
      });
      ipcRenderer.send('saveConfiguration', configuration, updateNow);
    },
    removeConfiguration: id => {
      this.state.setProperty({
        removingConfiguration: true,
      });
      ipcRenderer.send('removeConfiguration', { id });
    },
    updateAppConfigurations: (property, appConfigurations) => {
      ipcRenderer.send('saveAppConfigurations', { property, appConfigurations });
    }
  };

  componentDidMount = () => {
    ipcRenderer.send('initialize');

    ipcRenderer
      .on('connections', (event, { ssids, currentSsids }) => {
        this.state.setProperty({
          ssids: !!this.state.ssids.length && !ssids.length ? this.state.ssids : ssids,
          currentSsids,
          wifiEnabled: !!ssids.length || !!currentSsids.length,
          ssidsLoaded: true,
        });
      })
      .on('configurations', (event, configurations) => {
        this.state.setProperty({
          configurationsLoaded: true,
          configurations,
        });
      })
      .on('appConfigurations', (event, appConfigurations) => {
        this.state.setProperty({
          appConfigurationsLoaded: true,
          appConfigurations,
        });
      })
      .on('savedConfiguration', (event, value) => {
        this.state.setProperty({
          savingConfiguration: value,
          drawerVisible: false,
        });
        message.success('Configuration succesfully saved.');
      })
      .on('removedConfiguration', (event, value) => {
        this.state.setProperty({
          removingConfiguration: value,
          drawerVisible: false,
        });
        message.success('Configuration succesfully removed.');
      })
      .on('success', (event, data) => {
        console.log('success', data);
        message.success(data.message);
      })
      .on('error', (event, data) => {
        console.log('error', data);
        message.error(data.message);
      })
      .on('info', (event, data) => {
        console.log('info', data);
        message.info(data.message);
      })
      .on('warning', (event, data) => {
        console.log('warning', data);
        message.warn(data.message);
      })
      .on('loading', (event, data) => {
        console.log('loading', data);
        message.loading(data.message);
      })
      .on('update-notification', (event, data) => {
        let message = `
          <div class="version">
            <span class="title">Current version</span>
            <span class="value">${data.updates.currentVersion}</span>
          </div>
          <div class="version">
            <span class="title">Latest version</span>
            <span class="value">${data.updates.version}</span>
          </div>
        `;
        if (data.updates.releaseDate) {
          message = `${message}<div class="release"><span class="title">Release date</span><span class="value">${new Date(data.updates.releaseDate)}</span></div>`;
        }
        if (typeof data.updates.releaseNotes === 'string' && data.updates.releaseNotes.trim()) {
          message = `${message}<div class="release"><span class="title">Release notes</span><span class="value">${data.updates.releaseNotes}</span></div>`;
        } else if (typeof data.updates.releaseNotes === 'object') {
          message = `${message}<div class="release"><span class="title">Release notes</span><span class="value">`;
          Object.values(data.updates.releaseNotes).forEach(releaseNote => {
            message = `${message}<h2>Version ${releaseNote.version}</h2>${releaseNote.note}`;
          });
          message = `${message}</span></div>`;
        }
        notification[data.type || 'open']({
          message: data.title,
          description: <div dangerouslySetInnerHTML={{ __html: message }} />,
          duration: 0,
          key: 'update-notification',
          btn: (
            <React.Fragment>
              <Button type="default" size="small" onClick={() => notification.close('update-notification')}>
                {data.cancel}
              </Button>
              <Button type="primary" onClick={() => ipcRenderer.send(data.onConfirm)}>
                {data.confirm}
              </Button>
            </React.Fragment>
          ),
          onClose: () => notification.close('update-notification'),
        });
        closeOtherNotifications('update-notification');
      })
      .on('update-progress', (event, data) => {
        notification[data.type || 'open']({
          message: data.title,
          description: <Progress percent={((data.progress.percent).toFixed(2))} status={data.progress.percent < 100 ? 'active' : 'success'} />,
          duration: 0,
          key: 'update-progress',
          btn: !this.state.appConfigurations.updates.autoDownload && (
            <React.Fragment>
              <Button type="default" size="small" onClick={() => ipcRenderer.send(data.onCancel)}>
                {data.cancel}
              </Button>
            </React.Fragment>
          ),
          onClose: () => notification.close('update-progress'),
        });
        closeOtherNotifications('update-progress');
      })
      .on('update-downloaded', (event, data) => {
        notification[data.type || 'open']({
          message: data.title,
          description: data.message,
          duration: 0,
          key: 'update-downloaded',
          btn: (
            <React.Fragment>
              <Button type="default" size="small" onClick={() => notification.close('update-downloaded')}>
                {data.cancel}
              </Button>
              <Button type="primary" size="small" onClick={() => ipcRenderer.send(data.onConfirm)}>
                {data.confirm}
              </Button>
            </React.Fragment>
          ),
          onClose: () => notification.close('update-downloaded'),
        });
        closeOtherNotifications('update-downloaded');
      })
      .on('update-cancelled', (event, data) => {
        notification[data.type || 'open']({
          message: data.title,
          description: data.message,
          duration: 0,
          key: 'update-cancelled',
          btn: (
            <React.Fragment>
              <Button type="default" size="small" onClick={() => notification.close('update-cancelled')}>
                {data.cancel}
              </Button>
              <Button type="primary" size="small" onClick={() => ipcRenderer.send(data.onConfirm)}>
                {data.confirm}
              </Button>
            </React.Fragment>
          ),
          onClose: () => notification.close('update-notification'),
        });
        closeOtherNotifications('update-cancelled');
      })
      .on('newSlackInstance', (event, data) => {
        console.log('newSlackInstance', data);
      })
      .on('slackInstances', (event, slackInstances) => {
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
      'appConfigurations',
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
      ...notifications,
    ].forEach(channel => {
      ipcRenderer.removeAllListeners(channel);
    });
  }

  render = () => (
    <React.Fragment>
      {this.state.showLoading && (
        <Loading
          appConfigurationsLoaded={this.state.appConfigurationsLoaded}
          configurationsLoaded={this.state.configurationsLoaded}
          slackInstancesLoaded={this.state.slackInstancesLoaded}
          ssidsLoaded={this.state.ssidsLoaded}
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
