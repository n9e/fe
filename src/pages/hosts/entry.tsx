import React from 'react';
import { PATH } from './constants';

import './style.less';
import './locale';

const List = React.lazy(() => import('./pages/List'));

export default {
  routes: [
    {
      path: PATH,
      component: List,
      exact: true,
    },
  ],
};
