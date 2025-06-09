import React from 'react';

import { PATH } from './constants';
import List from './pages/List';
import './style.less';
import './locale';

export default {
  routes: [
    {
      path: PATH,
      component: List,
      exact: true,
    },
  ],
};
