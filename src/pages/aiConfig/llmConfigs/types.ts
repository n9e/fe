export interface LLMConfig {
  id: number;
  name: string;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  is_default: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;

  api_type: 'openai' | 'claude' | 'gemini';
  api_url: string;
  api_key: string;
  model: string;

  extra_config: {
    timeout_seconds?: number;
    skip_tls_verify?: boolean;
    proxy?: string;
    temperature?: number;
    max_tokens?: number;
    context_length?: number;
    custom_headers?: Record<string, string>;
    custom_params?: Record<string, any>;
  };
}

export type FormValues = {
  name: string;
  description: string;
  enabled: boolean;

  api_type: 'openai' | 'claude' | 'gemini';
  api_url: string;
  api_key: string;
  model: string;

  extra_config: {
    timeout_seconds?: number;
    skip_tls_verify?: boolean;
    proxy?: string;
    temperature?: number;
    max_tokens?: number;
    context_length?: number;
    custom_headers?: { key: string; value: string }[];
    custom_params?: string;
  };
};
