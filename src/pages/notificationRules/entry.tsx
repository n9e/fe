import React from 'react';

import './locale';
import { NS } from './constants';
import List from './pages/List';
import Add from './pages/Add';

export default {
  routes: [
    {
      path: `/${NS}`,
      component: List,
      exact: true,
    },
    {
      path: `/${NS}/add`,
      component: Add,
      exact: true,
    },
  ],
};
