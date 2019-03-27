import { createGlobalStyle } from 'styled-components';

import { FONT_SIZE } from './typography';

export const GlobalStyles = createGlobalStyle`
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-size: ${FONT_SIZE['regular']} !important;
  }

  #root {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
