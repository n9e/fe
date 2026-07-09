export interface LLMConfig {
  id: number;
  name: string;
}

export type AuthMode = 'none' | 'header' | 'oauth';

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
  auth_mode?: AuthMode;
}

export type FormValues = {
  name: string;
  description: string;
  enabled: boolean;

  url: string;
  headers?: { key: string; value: string }[];
  auth_mode?: AuthMode;
};

export interface OAuthStatus {
  connected: boolean;
  expiry?: number;
  scope?: string;
  client_id?: string;
  connected_by?: string;
  updated_at?: number;
}

export interface OAuthPrepareResult {
  authorize_url: string;
  state: string;
  redirect_uri: string;
}

export interface Tool {
  name: string;
  description: string;
}
