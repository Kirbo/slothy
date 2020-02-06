import { findFirstRoute } from '../../assets/utils';

const { name, type } = findFirstRoute();

const INITIAL_STATE = {
  appConfigurations: null,
  appConfigurationsLoaded: null,
  configurations: [],
  configurationsLoaded: false,
  currentSsids: [],
  drawerConfig: null,
  drawerVisible: false,
  emojiLimit: 100,
  expandedRowKeys: [],
  hideLoading: false,
  iface: null,
  removingConfiguration: false,
  savingConfiguration: false,
  searchEmoji: '',
  selectedEmoji: undefined,
  selectedView: name,
  showLoading: true,
  slackInstances: [],
  slackInstancesLoaded: false,
  ssidsLoaded: false,
  ssids: [],
  viewType: type,
  wifiEnabled: false,
  os: '',
};

export default INITIAL_STATE;
