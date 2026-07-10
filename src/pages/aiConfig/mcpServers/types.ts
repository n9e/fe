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

  /** 授权团队：拥有该 Server 的 user group id 列表 */
  user_group_ids: number[];
  /** 授权范围：0 公开，1 私有（仅授权团队可见/可用） */
  private: 0 | 1;
  /** 后端按当前用户计算，是否可管理（编辑/删除/测试等）；列表接口返回 */
  can_manage?: boolean;
}

export type FormValues = {
  name: string;
  description: string;
  enabled: boolean;

  url: string;
  headers?: { key: string; value: string }[];
  auth_mode?: AuthMode;

  user_group_ids: number[];
  private: 0 | 1;
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
