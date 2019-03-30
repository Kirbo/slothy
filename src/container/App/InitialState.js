const INITIAL_STATE = {
  showLoading: true,
  hideLoading: false,
  slackInstancesLoaded: false,
  ssidsLoaded: false,
  ssids: [],
  iface: null,
  slackInstances: [],
  currentToken: null,
  viewType: 'view',
  selectedView: 'Statuses',
};

export default INITIAL_STATE;
