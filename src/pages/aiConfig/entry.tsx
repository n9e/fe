import React from 'react';
import { Redirect } from 'react-router-dom';

import { IS_ENT } from '@/utils/constant';

import { PATH as agentPath } from './agents/constants';
import { PATH as llmConfigPath } from './llmConfigs/constants';
import { PATH as skillPath } from './skills/constants';

const AgentList = React.lazy(() => import('./agents/pages/List'));
const LLMConfigList = React.lazy(() => import('./llmConfigs/pages/List'));
const SkillList = React.lazy(() => import('./skills/pages/List'));

/** Soft-redirect legacy AI config list pages into FlashAI (ENT only). */
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
      // Open-source keeps standalone lists; ENT hosts them under /flashai/<item>.
      component: IS_ENT ? RedirectToFlashAiLlmConfigs : LLMConfigList,
      exact: true,
    },
    {
      path: `${skillPath}`,
      component: IS_ENT ? RedirectToFlashAiSkills : SkillList,
      exact: true,
    },
  ],
};
