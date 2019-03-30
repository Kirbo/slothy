import React from 'react';

import INITIAL_STATE from './InitialState';

const Context = React.createContext(INITIAL_STATE);
const { Consumer, Provider } = Context;

export {
  Consumer,
  Provider,
};
