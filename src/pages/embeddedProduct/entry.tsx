import React from 'react';

import { PATH } from './constants';
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
      path: `${PATH}/:id`,
      component: Detail,
      exact: true,
    },
  ],
};
