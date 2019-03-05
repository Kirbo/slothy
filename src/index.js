import React from 'react';
import ReactDOM from 'react-dom';
import { createGlobalStyle } from 'styled-components';

import AppProvider from './container/Context/AppProvider';
import { Consumer } from './container/Context/Context';

import Home from './container/Home';
import NotAuthorized from './container/NotAuthorized';

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

const Application = () => (
  <AppProvider>
    <GlobalStyles />
    <Consumer>
      {({ slackInstances }) => slackInstances.length > 0 ? <Home /> : <NotAuthorized />}
    </Consumer>
  </AppProvider>
);

ReactDOM.render(<Application />, document.getElementById('root'));
