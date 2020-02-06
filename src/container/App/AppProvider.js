import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { message, notification, Button, Progress } from 'antd';
import uuid from 'uuid/v4';

import INITIAL_STATE from './InitialState';
import { Provider } from './Context';
import Loading from '../Loading';

import { sortBy, openExternal } from '../../assets/utils';
import { RELEASES_URL } from '../../assets/constants';

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
    });
};

/* eslint-disable react/no-unused-state */
class AppProvider extends Component {
  state = {
    ...INITIAL_STATE,
    removeSlackInstance: ({ token, id }) => {
      ipcRenderer.send('removeSlackInstance', {
        id,
        token,
      });
    },
    setProperty: newState => {
      this.setState(prevState => ({
        ...prevState,
        ...newState,
      }));
    },
    getConnections: () => {
      const { setProperty } = this.state;
      clearTimeout(connectionsTimeout);
      setProperty({
        ssidsLoaded: false,
      });
      ipcRenderer.send('getConnections');
    },
    setStatus: ({ emoji, status, token }) => {
      ipcRenderer.send('setStatus', {
        emoji,
        status,
        token,
      });
    },
    selectView: ({ key, item }) => {
      const { setProperty } = this.state;
      const { type } = item.props;
      setProperty({
        viewType: type,
        selectedView: key,
      });
    },
    handleExpand: (expanded, record) => {
      const { setProperty, expandedRowKeys } = this.state;
      if (expanded) {
        setProperty({
          expandedRowKeys: [
            ...expandedRowKeys,
            record.key,
          ],
        });
      } else {
        setProperty({
          expandedRowKeys: expandedRowKeys.filter(key => key !== record.key),
        });
      }
    },
    modifyConfiguration: record => {
      const { setProperty } = this.state;
      setProperty({
        drawerConfig: {
          ...record,
          config: {
            ...record.config,
            instanceId: record.instanceId,
            id: record.config.id || uuid(),
          },
        },
        drawerVisible: true,
      });
    },
    saveConfiguration: (configuration, updateNow = true) => {
      const { setProperty } = this.state;
      setProperty({
        savingConfiguration: true,
        searchEmoji: '',
      });
      ipcRenderer.send('saveConfiguration', configuration, updateNow);
    },
    removeConfiguration: id => {
      const { setProperty } = this.state;
      setProperty({
        removingConfiguration: true,
      });
      ipcRenderer.send('removeConfiguration', {
        id,
      });
    },
    updateAppConfigurations: (property, appConfigurations) => {
      ipcRenderer.send('saveAppConfigurations', {
        property,
        appConfigurations,
      });
    },
  };

  componentDidMount = () => {
    const { setProperty } = this.state;
    ipcRenderer.send('initialize');

    ipcRenderer
      .on('connections', (event, props) => {
        const { ssids } = this.state;
        setProperty({
          ssids: !!ssids.length && !ssids.length ? ssids : props.ssids,
          currentSsids: props.currentSsids,
          wifiEnabled: !!ssids.length || !!props.currentSsids.length,
          ssidsLoaded: true,
        });
      })
      .on('setOs', (event, value) => {
        setProperty({
          os: value,
        });
      })
      .on('scanningConnections', () => {
        setProperty({
          ssidsLoaded: false,
        });
      })
      .on('configurations', (event, configurations) => {
        setProperty({
          configurationsLoaded: true,
          configurations,
        });
      })
      .on('appConfigurations', (event, newAppConfigurations) => {
        setProperty({
          appConfigurationsLoaded: true,
          appConfigurations: newAppConfigurations,
        });
      })
      .on('savedConfiguration', (event, value) => {
        setProperty({
          savingConfiguration: value,
          drawerVisible: false,
        });
        message.success('Configuration succesfully saved.');
      })
      .on('removedConfiguration', (event, value) => {
        setProperty({
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
        const { os } = this.state;
        let description = `
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
          description = `${description}
            <div class="release">
              <span class="title">Release date</span>
              <span class="value">${new Date(data.updates.releaseDate)}</span>
            </div>`;
        }
        if (typeof data.updates.releaseNotes === 'string' && data.updates.releaseNotes.trim()) {
          description = `${description}
            <div class="release">
              <span class="title">Release notes</span>
              <span class="value">${data.updates.releaseNotes}</span>
            </div>`;
        } else if (typeof data.updates.releaseNotes === 'object') {
          description = `${description}<div class="release"><span class="title">Release notes</span><span class="value">`;
          Object.values(data.updates.releaseNotes).forEach(releaseNote => {
            description = `${description}<h2>Version ${releaseNote.version}</h2>${releaseNote.note}`;
          });
          description = `${description}</span></div>`;
        }
        notification[data.type || 'open']({
          message: data.title,
          description: <div dangerouslySetInnerHTML={{ // eslint-disable-line react/no-danger
            __html: description,
          }}
          />,
          duration: 0,
          key: 'update-notification',
          btn: (
            <>
              <Button type="default" size="small" onClick={() => notification.close('update-notification')}>
                {data.cancel}
              </Button>
              {
                os === 'darwin'
                  ? (
                    <Button type="primary" onClick={() => ipcRenderer.send(data.onConfirm)}>
                      {data.confirm}
                    </Button>
                  )
                  : (
                    <Button
                      type="primary"
                      onClick={() => {
                        openExternal(`${RELEASES_URL}/tag/v${data.updates.version}`);
                        notification.close('update-notification');
                      }}
                    >
                      Download manually
                    </Button>
                  )
              }
            </>
          ),
          onClose: () => notification.close('update-notification'),
        });
        closeOtherNotifications('update-notification');
      })
      .on('update-progress', (event, data) => {
        const { appConfigurations } = this.state;
        notification[data.type || 'open']({
          message: data.title,
          description: <Progress percent={((data.progress.percent).toFixed(2))} status={data.progress.percent < 100 ? 'active' : 'success'} />,
          duration: 0,
          key: 'update-progress',
          btn: !appConfigurations.updates.autoDownload && (
            <>
              <Button type="default" size="small" onClick={() => ipcRenderer.send(data.onCancel)}>
                {data.cancel}
              </Button>
            </>
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
            <>
              <Button type="default" size="small" onClick={() => notification.close('update-downloaded')}>
                {data.cancel}
              </Button>
              <Button type="primary" size="small" onClick={() => ipcRenderer.send(data.onConfirm)}>
                {data.confirm}
              </Button>
            </>
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
            <>
              <Button type="default" size="small" onClick={() => notification.close('update-cancelled')}>
                {data.cancel}
              </Button>
              <Button type="primary" size="small" onClick={() => ipcRenderer.send(data.onConfirm)}>
                {data.confirm}
              </Button>
            </>
          ),
          onClose: () => notification.close('update-notification'),
        });
        closeOtherNotifications('update-cancelled');
      })
      .on('newSlackInstance', (event, data) => {
        console.log('newSlackInstance', data);
      })
      .on('slackInstances', (event, slackInstances) => {
        const { viewType } = this.state;
        let { selectedView } = this.state;

        if (
          (viewType === 'instance' && !selectedView && slackInstances.length)
          || (viewType === 'instance' && selectedView && slackInstances.length && !slackInstances.find(({ id }) => id === selectedView))
        ) {
          selectedView = slackInstances.sort(sortBy('name'))[0].id;
        }

        setProperty({
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
      'scanningConnections',
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

  render = () => {
    const {
      showLoading, appConfigurationsLoaded, configurationsLoaded, slackInstancesLoaded, ssidsLoaded, hideLoading, setProperty, connected,
    } = this.state;
    const { children } = this.props;

    return (
      <>
        {showLoading && (
          <Loading
            appConfigurationsLoaded={appConfigurationsLoaded}
            configurationsLoaded={configurationsLoaded}
            slackInstancesLoaded={slackInstancesLoaded}
            ssidsLoaded={ssidsLoaded}
            hideLoading={hideLoading}
            setProperty={setProperty}
            connected={connected}
          />
        )}
        <Provider value={this.state}>{children}</Provider>
      </>
    );
  }
}

AppProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default AppProvider;
