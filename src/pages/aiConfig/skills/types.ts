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

  builtin: boolean;
  instructions: string;
  license?: string;
  compatibility?: string;
  allowed_tools?: string;
  metadata?: Record<string, any>;
}

export interface FormValues {
  name: string;
  description: string;
  enabled: boolean;

  instructions: string;
  license?: string;
  compatibility?: string;
  allowed_tools?: string;
  metadata?: Record<string, any>;
}

export interface FileItem {
  id: number;
  skill_id: number;
  name: string;
  size: number;
  created_at: string;
  created_by: string;
}
