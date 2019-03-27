import React from 'react';

import { Consumer } from '../Context/Context';

import Home from '../Home';
import NotAuthorized from '../NotAuthorized';


const App = () => (
  <Consumer>
    {({ slackInstances }) => slackInstances.length > 0 ? <Home /> : <NotAuthorized />}
  </Consumer>
);

export default App;
