import React from 'react';
import { NS } from './constants';
import List from './pages/ListWithPageLayout';

import './locale';

export default {
  routes: [
    {
      path: `/${NS}`,
      component: List,
      exact: true,
    },
  ],
};
