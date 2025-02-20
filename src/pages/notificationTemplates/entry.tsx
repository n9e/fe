import React from 'react';

import './locale';
import { NS } from './constants';
import List from './pages/List';

export default {
  routes: [
    {
      path: `/${NS}`,
      component: List,
      exact: true,
    },
  ],
};
