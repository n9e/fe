import React from 'react';
import { NS } from './constants';

import './locale';

const List = React.lazy(() => import('./pages/ListWithPageLayout'));
const Edit = React.lazy(() => import('./pages/EditWithPageLayout'));
const Executions = React.lazy(() => import('./pages/Executions'));
const ExecutionDetail = React.lazy(() => import('./pages/Executions/DetailWithPageLayout'));

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
