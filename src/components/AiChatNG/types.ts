import React from 'react';
import type { ActionManifestEntry, ActionResponse } from '@flashcatcloud/ai-kit/actions';

export type AiChatPageType = 'dashboards' | 'alert' | 'record' | 'explorer' | 'alert_rule' | 'alert_history' | 'active_alert' | 'notify_tpl' | 'datasource';

export interface IAiChatPageInfo {
  /**
   * 当前页面 url（不含域名），仅包含 pathname + search
   * 例如：/explorer/metric?ids=1
   */
  url: string;
  param?: Record<string, unknown>;
}

/** Page info, or a reader for it: the page's current state is read when a message is sent. */
export type AiChatPageFromSource = IAiChatPageInfo | (() => IAiChatPageInfo);

export interface IAiChatAction {
  key?: string;
  param?: IAiChatActionParam;
}

export interface IAiChatActionParam {
  datasource_type?: string;
  datasource_id?: number;
  database_name?: string;
  table_name?: string;
  [key: string]: unknown;
}

export interface IAiChatAction {
  content?: string;
  prefillOnly?: boolean; // 是否仅预填充内容，禁止自动发送消息
  key?: string;
  param?: IAiChatActionParam;
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
  FormSelect = 'form_select',
  AlertRule = 'alert_rule',
  Dashboard = 'dashboard',
  /** The model asking the page to run one of the actions it declared. Always
   *  the last segment of a message: the turn ends on it. */
  PageAction = 'page_action',
  /** A run of consecutive tool calls, already folded by the backend; the
   *  calls are in `param.items`, each named for a reader. */
  ToolGroup = 'tool_group',
  /** The assistant ended its turn asking the user something. The question is
   *  in `param`; answering is the next message on the same chat. */
  InputRequest = 'input_request',
}

/** `param` of a `tool_group` segment. */
export interface IAiChatToolCallGroup {
  command_count: number;
  read_file_count: number;
  edit_file_count: number;
  items?: IAiChatMessageResponse[];
}

/** `param` of an `input_request` segment. */
export interface IAiChatInputRequest {
  question: string;
  options?: { id: string; label: string }[];
  allow_custom?: boolean;
}

/** `param` of a `page_action` segment. Mirrors the backend's PageActionRequest. */
export interface IAiChatPageActionRequest {
  call_id: string;
  name: string;
  /** The page's own description of the action, so the card needs no lookup. */
  description: string;
  args: Record<string, unknown>;
}

export interface IAiChatStreamSegment {
  kind: 'thinking' | 'text';
  content: string;
  done: boolean;
}

export interface IAiChatMessageResponse {
  content_type: string;
  content: string;
  stream_id?: string;
  is_finish?: boolean;
  is_from_ai?: boolean;
  hint_text?: string;
  /** Segment-specific payload; `page_action` carries an IAiChatPageActionRequest. */
  param?: unknown;
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
  /** What the page behind the chat can do right now; each entry becomes a
   *  tool the model can call. Forwarded from the action runtime as is. */
  manifest?: ActionManifestEntry[];
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

export interface IAiChatQueryContentContext {
  message: IAiChatMessage;
  response: IAiChatMessageResponse;
}

export type AiChatExecuteQueryForQueryContent = (query: string, context: IAiChatQueryContentContext) => void;

/** One user turn as the panel sees it: running from the moment the message is
 *  accepted, done once the backend marks it finished, stopped or failed. */
export interface IAiChatTurn {
  phase: 'running' | 'done';
  message: IAiChatMessage;
  /** Why a done turn ended, when not by finishing on its own. */
  reason?: 'stopped' | 'error';
  actionOutcome?: ActionResponse;
}

/** A page captures the target before a turn sends any asynchronous request. */
export interface IAiChatTurnScope {
  executePageAction(request: IAiChatPageActionRequest): Promise<ActionResponse>;
  cancel(): void;
  finish?(): void;
}

export interface IAiQueryProgress {
  phase: 'idle' | 'applying' | 'querying' | 'success' | 'empty' | 'failed' | 'changed' | 'stopped' | 'undone';
  stage?: 'unchanged' | 'filled' | 'queried';
  message?: string;
  /** The model's one-line suggestion for the next refinement, shown as the composer placeholder after delivery. */
  followUp?: string;
  /** Series the page's own query returned, when it reported one. */
  count?: number;
}

/** Outcome of the page actions this panel ran, keyed by call id. */
export type AiChatPageActionOutcomes = Record<string, ActionResponse>;

export interface IAiChatProps {
  className?: string;
  inputContainerClassName?: string;
  placeholder?: string;
  /** Slim only: text Tab fills into an empty composer — the host's suggested next message. */
  suggestion?: string;
  chatId?: string;
  /**
   * `slim` is the panel embedded under a page's own input: one-line input row
   * with room for the host's status and controls, and a message list that
   * floats below it instead of filling a column. Defaults to `full`.
   */
  variant?: 'full' | 'slim';
  /** Slim only: hide the message list, keep the input row. */
  collapsed?: boolean;
  /** Slim only: rendered inside the input row, before the text box. */
  inputPrefix?: React.ReactNode;
  /** Slim only: rendered inside the input row, after the send button. */
  inputSuffix?: React.ReactNode;
  /** Fires as a turn starts, progresses and ends. */
  onTurn?: (turn: IAiChatTurn) => void;
  prepareTurn?: () => IAiChatTurnScope | undefined;
  onConversationInteract?: () => void;
  onBusyChange?: (busy: boolean) => void;
  /** Closing an embedded surface stops its active turn but preserves history. */
  active?: boolean;
  queryPageFrom: AiChatPageFromSource;
  queryAction?: IAiChatAction;
  welcomeSlot?: React.ReactNode | ((onPromptClick: (prompt: string) => void) => React.ReactNode);
  promptList?: Array<string | { label: string; value: string }>;
  initialMessage?: string;
  onExecuteQueryForQueryContent?: AiChatExecuteQueryForQueryContent;
  onChatChange?: (chat?: IAiChatHistoryItem) => void;
  onError?: (error: Error) => void;
}

export type AiChatMode = 'drawer' | 'floating';
