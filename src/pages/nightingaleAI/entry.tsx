import React from 'react';

import { IS_ENT } from '@/utils/constant';

const NightingaleAIPage = React.lazy(() => import('./index'));

export default {
  routes: IS_ENT
    ? []
    : [
        {
          path: '/nightingale-ai',
          component: NightingaleAIPage,
        },
      ],
};
