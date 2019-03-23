import React from 'react';
import { render as ReactDOMRender } from 'react-dom';
import { createGlobalStyle } from 'styled-components';

import AppProvider from './container/Context/AppProvider';
import { Consumer } from './container/Context/Context';

import Home from './container/Home';
import NotAuthorized from './container/NotAuthorized';

const Application = () => (
  <AppProvider>
    <GlobalStyles />
    <Consumer>
      {({ slackInstances }) => slackInstances.length > 0 ? <Home /> : <NotAuthorized />}
    </Consumer>
  </AppProvider>
);


const GlobalStyles = createGlobalStyle`
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  #root {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const mount = document.getElementById('root');

/**
 * Render
 * @param {Object} Component - Component to render.
 */
const render = Component => {
  ReactDOMRender(<Component />, mount);
};

if (module.hot) {
  module.hot.accept();
}

document.querySelector('.loading').classList.add('loaded');

render(Application);
