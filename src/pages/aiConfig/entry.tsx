import React from 'react';

import { PATH as agentPath } from './agents/constants';
import { PATH as llmConfigPath } from './llmConfigs/constants';
import { PATH as skillPath } from './skills/constants';
import { PATH as mcpServerPath } from './mcpServers/constants';

const AgentList = React.lazy(() => import('./agents/pages/List'));
const LLMConfigList = React.lazy(() => import('./llmConfigs/pages/List'));
const SkillList = React.lazy(() => import('./skills/pages/List'));
const MCPServerList = React.lazy(() => import('./mcpServers/pages/List'));

export default {
  routes: [
    {
      path: `${agentPath}`,
      component: AgentList,
      exact: true,
    },
    {
      path: `${llmConfigPath}`,
      component: LLMConfigList,
      exact: true,
    },
    {
      path: `${skillPath}`,
      component: SkillList,
      exact: true,
    },
    {
      path: `${mcpServerPath}`,
      component: MCPServerList,
      exact: true,
    },
  ],
};
