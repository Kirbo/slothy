const INITIAL_STATE = {
  wifiEnabled: false,
  showLoading: true,
  hideLoading: false,
  slackInstancesLoaded: false,
  ssidsLoaded: false,
  ssids: [],
  iface: null,
  slackInstances: [],
  currentToken: null,
  viewType: 'view',
  selectedView: 'Configuration',
};

export default INITIAL_STATE;
