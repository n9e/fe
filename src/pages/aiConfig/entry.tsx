import React from 'react';

import { PATH as agentPath } from './agents/constants';
import AgentList from './agents/pages/List';

import { PATH as llmConfigPath } from './llmConfigs/constants';
import LLMConfigList from './llmConfigs/pages/List';

import { PATH as skillPath } from './skills/constants';
import SkillList from './skills/pages/List';

import { PATH as mcpServerPath } from './mcpServers/constants';
import MCPServerList from './mcpServers/pages/List';

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
