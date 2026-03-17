export interface LLMConfig {
  id: number;
  name: string;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;

  use_case: string;
  llm_config_id: number;
  llm_config: LLMConfig;
  skill_ids: number[];
  mcp_server_ids: number[];
}

export type FormValues = Pick<Item, 'name' | 'description' | 'enabled' | 'use_case' | 'llm_config_id' | 'skill_ids' | 'mcp_server_ids'>;
