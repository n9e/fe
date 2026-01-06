import { PATHNAME } from './constants';
import Index from './index';

import './locale';

import './style.less';

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
