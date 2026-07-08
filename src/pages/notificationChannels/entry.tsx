import React from 'react';

import './locale';
import { NS } from './constants';

const ListNG = React.lazy(() => import('./pages/ListNG'));
const Add = React.lazy(() => import('./pages/Add'));
const Edit = React.lazy(() => import('./pages/Edit'));

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
