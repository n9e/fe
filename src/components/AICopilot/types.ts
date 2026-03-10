export interface AIChatRequest {
  action_key: string; // e.g. "query_generator"
  user_input: string;
  history?: ChatMessage[];
  context?: Record<string, any>; // action-specific params
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'text' | 'done' | 'error';
  content: string;
  delta?: string;
  metadata?: {
    name?: string;
    input?: string;
    [key: string]: any;
  };
  done?: boolean;
  error?: string;
  timestamp: number;
}

export interface DoneResponse {
  type: 'done';
  duration_ms: number;
  message: string; // accumulated reasoning/thinking text
  response: string; // final answer content (may contain JSON with query/explanation)
}

export interface ToolCallInfo {
  name: string;
  input?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  toolCalls?: ToolCallInfo[];
  query?: string;
  explanation?: string;
  isStreaming?: boolean;
  error?: string;
}

export interface AIConversation {
  id: number;
  title: string;
  user_id: number;
  context: string; // JSON string, page-specific context
  created_at: number;
  updated_at: number;
}

export const SUPPORTED_DATASOURCE_TYPES = ['prometheus', 'mysql', 'doris', 'ck', 'pgsql'];
