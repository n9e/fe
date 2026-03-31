import React from 'react';

export type AiChatPageType = 'dashboards' | 'alert' | 'record' | 'explorer';

export interface IAiChatPageInfo {
  page: AiChatPageType;
  param?: Record<string, unknown>;
}

export interface IAiChatActionParam {
  datasource_type?: string;
  datasource_id?: number;
  database_name?: string;
  table_name?: string;
  [key: string]: unknown;
}

export interface IAiChatAction {
  key: string;
  param: IAiChatActionParam;
}

export interface IAiChatMessageQuery {
  content: string;
  action?: IAiChatAction;
  page_from: IAiChatPageInfo;
}

export enum EAiChatContentType {
  Thinking = 'thinking',
  Reasoning = 'reasoning',
  Markdown = 'markdown',
  Hint = 'hint',
  Query = 'query',
}

export interface IAiChatMessageResponse {
  content_type: string;
  content: string;
  stream_id?: string;
  is_finish?: boolean;
  is_from_ai?: boolean;
  hint_text?: string;
}

export interface IAiChatMessage {
  chat_id: string;
  seq_id: number;
  query: IAiChatMessageQuery;
  response?: IAiChatMessageResponse[];
  cur_step?: string;
  is_finish?: boolean;
  recommend_action?: IAiChatAction[];
  err_code?: number;
  err_title?: string;
  err_msg?: string;
  executed_tools?: boolean;
}

export interface IAiChatHistoryItem {
  chat_id: string;
  title: string;
  last_update: number;
  page_from?: IAiChatPageInfo;
  recommend_action?: IAiChatAction[];
  user_id?: number;
  is_new?: boolean;
}

export interface IAiChatCreateChatRequest extends IAiChatPageInfo {}

export interface IAiChatSendMessageRequest {
  chat_id: string;
  query: IAiChatMessageQuery;
}

export interface IAiChatSendMessageResponse {
  chat_id: string;
  seq_id: number;
}

export interface IAiChatMessageLocator {
  chat_id: string;
  seq_id: number;
}

export interface IAiChatMessageHistoryRequest {
  chat_id: string;
}

export interface IAiChatStreamChunk {
  type: 'thinking' | 'text' | 'tool_call' | 'tool_result' | 'done' | 'error' | string;
  content?: string;
  delta?: string;
  done?: boolean;
  error?: string;
  timestamp?: number;
  p?: 'content' | 'reason' | string;
  v?: string;
}

export interface IAiChatHiddenFeature {
  history?: boolean;
  closeIcon?: boolean;
  prompt?: boolean;
  header?: boolean;
}

export interface IAiChatRenderContext {
  message: IAiChatMessage;
  response: IAiChatMessageResponse;
  isStreaming: boolean;
  onExecuteAction?: (action: IAiChatAction) => void;
  maybeScrollToBottom?: (behavior?: ScrollBehavior) => void;
}

export type AiChatCustomContentRenderer = (context: IAiChatRenderContext) => React.ReactNode;

export interface IAiChatProps {
  className?: string;
  placeholder?: string;
  chatId?: string;
  queryPageFrom: IAiChatPageInfo;
  queryAction?: IAiChatAction;
  welcomeSlot?: React.ReactNode;
  promptList?: string[];
  customContentRenderer?: AiChatCustomContentRenderer;
  onChatChange?: (chat?: IAiChatHistoryItem) => void;
  onError?: (error: Error) => void;
}
