import React from 'react';
import { Redirect } from 'react-router-dom';

import { PATH as agentPath } from './agents/constants';
import { PATH as llmConfigPath } from './llmConfigs/constants';
import { PATH as skillPath } from './skills/constants';

const AgentList = React.lazy(() => import('./agents/pages/List'));

/** Soft-redirect legacy AI config list pages into FlashAI config host. */
function RedirectToFlashAiLlmConfigs() {
  return <Redirect to='/flashai/llm-configs' />;
}

function RedirectToFlashAiSkills() {
  return <Redirect to='/flashai/skills' />;
}

export default {
  routes: [
    {
      path: `${agentPath}`,
      component: AgentList,
      exact: true,
    },
    {
      path: `${llmConfigPath}`,
      component: RedirectToFlashAiLlmConfigs,
      exact: true,
    },
    {
      path: `${skillPath}`,
      component: RedirectToFlashAiSkills,
      exact: true,
    },
  ],
};
