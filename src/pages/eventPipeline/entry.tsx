import React from 'react';
import { NS } from './constants';
import List from './pages/ListWithPageLayout';
import Executions from './pages/Executions';

import './locale';

export default {
  routes: [
    {
      path: `/${NS}`,
      component: List,
      exact: true,
    },
    {
      path: `/${NS}-executions`,
      component: Executions,
      exact: true,
    },
  ],
};
