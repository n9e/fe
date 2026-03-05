export interface QueryGeneratorRequest {
  datasource_type: string; // prometheus, mysql, doris, ck, pgsql
  datasource_id: number;
  database_name?: string;
  table_name?: string;
  user_input: string;
  history?: ChatMessage[];
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

export const SUPPORTED_DATASOURCE_TYPES = ['prometheus', 'mysql', 'doris', 'ck', 'pgsql'];
