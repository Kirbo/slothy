import { findFirstRoute } from '../../assets/utils';

const { name, type } = findFirstRoute();

const INITIAL_STATE = {
  slackInstancesLoaded: false,
  ssidsLoaded: false,
  configurationsLoaded: false,
  wifiEnabled: false,
  showLoading: true,
  hideLoading: false,
  currentSsids: [],
  ssids: [],
  iface: null,
  slackInstances: [],
  configurations: [],
  expandedRowKeys: [],
  viewType: type,
  selectedView: name,
  drawerConfig: null,
  searchEmoji: '',
  selectedEmoji: undefined,
  emojiLimit: 100,
  drawerVisible: false,
  savingConfiguration: false,
  removingConfiguration: false,
};

export default INITIAL_STATE;
