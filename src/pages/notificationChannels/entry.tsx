import React from 'react';

import './locale';
import { NS } from './constants';
import ListNG from './pages/ListNG';
import Add from './pages/Add';
import Edit from './pages/Edit';

export default {
  routes: [
    {
      path: `/${NS}`,
      component: ListNG,
      exact: true,
    },
    {
      path: `/${NS}/add`,
      component: Add,
      exact: true,
    },
    {
      path: `/${NS}/edit/:id`,
      component: Edit,
      exact: true,
    },
  ],
};
