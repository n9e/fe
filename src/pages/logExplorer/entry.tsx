import React from 'react';
import { PATHNAME } from './constants';

import './locale';

import './style.less';

// 页面本体懒加载：entry 会被 import.meta.glob({ eager: true }) 在启动时同步加载，
// 若直接静态 import ./index 会把整棵页面树（含数据源插件）在登录页就拉起。
const Index = React.lazy(() => import('./index'));

export default {
  routes: [
    {
      path: PATHNAME,
      component: Index,
      exact: true,
    },
    {
      path: `${PATHNAME}-ng`,
      component: Index,
      exact: true,
    },
  ],
};
