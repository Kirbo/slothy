import React from 'react';
import { render as ReactDOMRender } from 'react-dom';

import { GlobalStyles } from './assets/css';
import AppProvider from './container/App/AppProvider';

import App from './container/App';

import theme from './assets/theme';

const mount = document.getElementById('root');

const render = Component => {
  ReactDOMRender(
    <AppProvider theme={theme}>
      <GlobalStyles />
      <Component />
    </AppProvider>,
    mount,
  );
};

if (module.hot) {
  module.hot.accept();
  const NextApp = require('./container/App').default; // eslint-disable-line global-require
  render(NextApp);
}

render(App);
