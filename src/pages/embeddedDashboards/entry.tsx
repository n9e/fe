import React from 'react';
import Audits from './index';
import './style.less';
import './locale';

export default {
  routes: [
    {
      path: '/embedded-dashboards',
      component: Audits,
      exact: true,
    },
  ],
};
