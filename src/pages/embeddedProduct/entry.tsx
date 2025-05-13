import React from 'react';

import { PATH, DETAIL_PATH } from './constants';
import List from './pages/List';
import Detail from './pages/Detail';
import './locale';

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
