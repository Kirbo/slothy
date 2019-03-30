export const LS_SLACK_INSTANCES_KEY = 'slackInstances';

const YEAR_STARTED = 2019;
const YEAR_NOW = new Date().getFullYear();
const YEAR_END = `${YEAR_NOW > YEAR_STARTED ? ` - ${YEAR_NOW}` : ''}`;
export const COPYRIGHT_YEAR = `${YEAR_STARTED}${YEAR_END}`;
export const COPYRIGHT = `Kirbo © ${COPYRIGHT_YEAR}`;
