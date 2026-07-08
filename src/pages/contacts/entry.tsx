import React from 'react';

import './locale';
import { NS } from './constants';

const List = React.lazy(() => import('./pages/List'));

export default {
  routes: [
    {
      path: `/${NS}`,
      component: List,
      exact: true,
    },
  ],
};
