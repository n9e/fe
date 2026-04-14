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

  url: string;
  headers?: Record<string, string>;
}

export type FormValues = {
  name: string;
  description: string;
  enabled: boolean;

  url: string;
  headers?: { key: string; value: string }[];
};

export interface Tool {
  name: string;
  description: string;
}
