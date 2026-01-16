import React from 'react';
import { NS } from './constants';
import List from './pages/ListWithPageLayout';
import Edit from './pages/EditWithPageLayout';
import Executions from './pages/Executions';
import ExecutionDetail from './pages/Executions/DetailWithPageLayout';

import './locale';

export default {
  routes: [
    {
      path: `/${NS}`,
      component: List,
      exact: true,
    },
    {
      path: `/${NS}/edit/:id`,
      component: Edit,
      exact: true,
    },
    {
      path: `/${NS}-executions`,
      component: Executions,
      exact: true,
    },
    {
      path: `/${NS}-executions/detail/:id`,
      component: ExecutionDetail,
      exact: true,
    },
  ],
};
