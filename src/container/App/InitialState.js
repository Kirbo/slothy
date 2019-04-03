import { findFirstRoute } from '../../assets/utils';

const { name, type } = findFirstRoute();

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
  viewType: type,
  selectedView: name,
};

export default INITIAL_STATE;
