const INITIAL_STATE = {
  wifiEnabled: false,
  showLoading: true,
  hideLoading: false,
  slackInstancesLoaded: false,
  ssidsLoaded: false,
  ssids: [],
  iface: null,
  slackInstances: [],
  configurations: [],
  currentToken: null,
  viewType: 'view',
  selectedView: 'Configuration',
};

export default INITIAL_STATE;
