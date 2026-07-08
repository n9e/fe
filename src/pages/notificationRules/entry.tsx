import React from 'react';

import { NS } from './constants';
import './style.less';
import './locale';

const List = React.lazy(() => import('./pages/List'));
const Add = React.lazy(() => import('./pages/Add'));
const Edit = React.lazy(() => import('./pages/Edit'));
const Detail = React.lazy(() => import('./pages/Detail'));

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
    {
      path: `/${NS}/edit/:id`,
      component: Edit,
      exact: true,
    },
    {
      path: `/${NS}/detail/:id`,
      component: Detail,
      exact: true,
    },
  ],
};
