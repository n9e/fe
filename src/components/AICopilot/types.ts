// --- Page Info (aligned with fc-model PageInfo) ---
export interface AssistantPageInfo {
  page: string;
  param?: AssistantPageInfoParam;
}

export interface AssistantPageInfoParam {
  workspace_id?: number;
  dashboard?: { id: any; var?: Record<string, any[]>; start?: number; end?: number };
  datasource_type?: string;
  datasource_id?: number;
}

// --- Action (aligned with fc-model Action) ---
export interface AssistantAction {
  content?: string;
  key: string;
  param?: AssistantActionParam;
}

export interface AssistantActionParam {
  datasource_type?: string;
  datasource_id?: number;
  database_name?: string;
  table_name?: string;
}

// --- Chat (aligned with fc-model Chat) ---
export interface AssistantChat {
  chat_id: string;
  title: string;
  last_update: number;
  page_from: AssistantPageInfo;
  recommend_action: AssistantAction[];
  user_id: number;
  is_new: boolean;
}

// --- Message (aligned with fc-model Message) ---
export interface AssistantMessageDetail {
  chat_id: string;
  seq_id: number;
  model_id: number;
  query: AssistantMessageQuery;
  response: AssistantMessageResponse[];
  cur_step: string;
  is_finish: boolean;
  feedback: AssistantMessageFeedback;
  recommend_action: AssistantAction[];
  err_code: number;
  err_title: string;
  err_msg: string;
  executed_tools: boolean;
}

export interface AssistantMessageQuery {
  content: string;
  action: AssistantAction;
  page_from: AssistantPageInfo;
}

export interface AssistantMessageResponse {
  content_type: string; // "markdown" | "hint"
  content: string;
  hint_text?: string;
  stream_id?: string;
  is_finish: boolean;
  param?: any;
  is_from_ai: boolean;
}

export interface AssistantMessageFeedback {
  chat_id: string;
  seq_id: number;
  status: number; // 0=none, 1=like, -1=dislike, -2=cancel
}

// --- Stream ---
export interface StreamEvent {
  v: string;
  p: string; // "content" or "reason"
}

export const SUPPORTED_DATASOURCE_TYPES = ['prometheus', 'mysql', 'doris', 'ck', 'pgsql'];
