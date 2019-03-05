import React from 'react';
import ReactDOM from 'react-dom';
import { createGlobalStyle } from 'styled-components';

import AppProvider from './container/Context/AppProvider';

import Home from './container/Home';

const GlobalStyles = createGlobalStyle`
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
`;

const Application = () => (
  <AppProvider>
    <GlobalStyles />
    <Home />
  </AppProvider>
);

ReactDOM.render(<Application />, document.getElementById('root'));
