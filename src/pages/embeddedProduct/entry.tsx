import React from 'react';

import { PATH, DETAIL_PATH } from './constants';
import './locale';

const List = React.lazy(() => import('./pages/List'));
const Detail = React.lazy(() => import('./pages/Detail'));

export default {
  routes: [
    {
      path: PATH,
      component: List,
      exact: true,
    },
    {
      path: `${DETAIL_PATH}/:id`,
      component: Detail,
      exact: true,
    },
  ],
};
