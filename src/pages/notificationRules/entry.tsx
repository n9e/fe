import React from 'react';

import { NS } from './constants';
import List from './pages/List';
import Add from './pages/Add';
import Edit from './pages/Edit';
import Detail from './pages/Detail';
import './style.less';
import './locale';

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
