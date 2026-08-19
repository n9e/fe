import React from 'react';
import { Redirect } from 'react-router-dom';

import { IS_ENT } from '@/utils/constant';

import { PATH as agentPath } from './agents/constants';
import { PATH as llmConfigPath } from './llmConfigs/constants';
import { PATH as skillPath } from './skills/constants';

const AgentList = React.lazy(() => import('./agents/pages/List'));
const LLMConfigList = React.lazy(() => import('./llmConfigs/pages/List'));
const SkillList = React.lazy(() => import('./skills/pages/List'));

/** Soft-redirect legacy AI config list pages into Nightingale AI (专业版). */
function RedirectToNightingaleAiLlmConfigs() {
  return <Redirect to='/nightingale-ai/llm-configs' />;
}

function RedirectToNightingaleAiSkills() {
  return <Redirect to='/nightingale-ai/skills' />;
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
      component: IS_ENT ? LLMConfigList : RedirectToNightingaleAiLlmConfigs,
      exact: true,
    },
    {
      path: `${skillPath}`,
      component: IS_ENT ? SkillList : RedirectToNightingaleAiSkills,
      exact: true,
    },
  ],
};
