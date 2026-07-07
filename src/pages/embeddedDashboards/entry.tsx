import React from 'react';
import './style.less';
import './locale';

const Audits = React.lazy(() => import('./index'));

export default {
  routes: [
    {
      path: '/embedded-dashboards',
      component: Audits,
      exact: true,
    },
  ],
};
