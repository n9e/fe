import { EPageType } from '../config';

export interface IMatchRoute {
  path: string;
  url: string;
  isExact: boolean;
  params: any;
  pageType: EPageType;
}

export interface IHiddenFeature {
  fullScreen?: boolean; // 全屏按钮
  knowledgeBase?: boolean; // 知识库按钮
  chatHistory?: boolean; // 聊天历史按钮
  closeIcon?: boolean; // 关闭按钮
  promptIcon?: boolean; // 提示词按钮
  modalSelector?: boolean; // 模型选择器
  scheduledTask?: boolean; // 定时任务按钮
}

export interface IFiremapUrlParams {
  firemap_analysis_mode: EFiremapAnalysisMode;
  spaceId?: string;
  time?: string;
  aiBusinessId?: string;
  aiGroupId?: string;
  aiCardId?: string;
  aiCardName?: string;
}

export interface ISloUrlParams {
  ai_analysis_mode?: EActionKey.SloInspection | string;
  sloId?: string;
  sloName?: string;
}

export interface IFiremapTimestampSummary {
  default: number;
  card_id_by_timestamp: {
    [key: string]: number[];
  };
}

export interface ApiCreatChat {
  url: string;
  page?: EPageType;
  param?: {
    dashboard?: IDashboardAction;
    workspace_id?: number;
    business_id?: number;
    timestamp?: number; // 灭火图页面时间戳
    firemap_timestamp_summary?: IFiremapTimestampSummary;
    active_alert?: IActiveAlert;
    slo?: ISlo;
  };
  cloud_assistant?: boolean;
}

export interface ApiSendMessage {
  chat_id: string;
  model_id: number;
  query: {
    content: string;
    action?: IRecommendActionItem;
    page_from: ApiCreatChat;
  };
}

export interface IRecommendActionItem {
  content: string;
  key: string;
  param: any;
}

export interface IMessageQuery {
  content: string;
  action?: IRecommendActionItem;
}

export enum EFeedbackStatus {
  Like = 1,
  None = 0,
  Dislike = -1,
}

export enum EContentType {
  Thinking = 'thinking',
  Markdown = 'markdown',
  FiremapCheckItem = 'firemap_check_item',
  Hint = 'hint',
  Reasoning = 'reasoning',
  Tool = 'tool',

  // n9e
  Query = 'query',
  FormSelect = 'form_select',
  AlertRule = 'alert_rule',
  Dashboard = 'dashboard',
}

export interface IMessageParam {
  mode?: string;
  business_id?: string;
  card_id?: string;
  workspace_id?: string;
  dashboard_id?: number;
  ts?: number;
  param?: string;
  result?: string;
}

export interface IMessageResponse {
  content_type: EContentType; // 数据类型，目前有三种，markdown , firemap_check_item , hint
  content: string; // markdown 类型，完整的文本
  stream_id: string; // markdown 类型，stream_id
  is_finish: boolean; // markdown 类型，是否完成
  param: IMessageParam;
  hint_text?: string;
}

export interface IHistoryItem {
  chat_id: string;
  title: string;
  summary?: string;
  create_at?: number;
  last_update: number;
  seq_id?: number;
  page_from: {
    page: string;
    param: any;
  };
  recommend_action: IRecommendActionItem[];
}

export interface IMessageDetail {
  chat_id: string;
  seq_id: number;
  model_id: number;
  query: IMessageQuery;
  response?: IMessageResponse[];
  response_time?: number;
  cur_step?: string;
  is_finish?: boolean;
  feedback?: {
    chat_id: string;
    seq_id: number;
    status: EFeedbackStatus;
  };
  recommend_action?: IRecommendActionItem[];
  err_code?: number;
  err_msg?: string;
  err_title?: string;
  client_created_at?: number;
}

export interface IActionParams {
  firemap_analysis_mode: EFiremapAnalysisMode;
  workspace_id: number;
  timestamp: number;
  business_id?: number;
  group_id?: number;
  card_id?: number;
  firemap_timestamp_summary?: IFiremapTimestampSummary;
}

export enum EActionKey {
  FiremapGlobalAnalysis = 'firemap_global_analysis',
  FiremapCardAnalysis = 'firemap_card_analysis',
  SloInspection = 'slo_inspection',
}

export enum EFiremapAnalysisMode {
  Global = 'global',
  Business = 'business',
  Group = 'group',
  Card = 'card',
}

export interface IFiremapAction {
  content: string;
  action: {
    key: EActionKey;
    param: IActionParams;
  };
  /** 仅将 content 填入输入框，不自动发消息（如创建引导「AI自动创建」） */
  prefillOnly?: boolean;
}

export interface IDashboardAction {
  id: string;
  start?: number;
  end?: number;
  var?: {
    [key: string]: string[];
  };
}

export interface IActiveAlert {
  start?: number;
  end?: number;
  my_groups?: boolean; // “我的业务组” or "全部业务组"
  rule_prods?: string[]; // 监控类型
  severity?: string[]; // 告警等级
  datasource_ids?: string[]; // 数据源
}

export interface ISloAction {
  content: string;
  action: {
    key: EActionKey.SloInspection;
    param: {
      slo_id: number;
      start?: number;
      end?: number;
    };
  };
}
export interface IParamsAiAction {
  page?: EPageType | any;
  url?: string;
  firemap?: IFiremapAction;
  dashboard?: IDashboardAction;
  active_alert?: IActiveAlert;
  slo?: ISloAction;

  custom?: {
    content: string;
    action?: { key: string; param?: any };
    /** true: 只填到输入框；false/缺省: 自动发送 */
    prefillOnly?: boolean;
  };
}

export enum IKnowledgeTarget {
  Firemap = 'firemap',
  Dashboard = 'dashboard',
}

export interface IKnowledgeDashboard {
  dashboard_id: number;
  business_id: number;
}

export interface IKnowledgeFiremap {
  business_group_id: number;
  business_id: number;
  group_id: number;
  card_id: number;
  firemap_type: string;
  firemap_level: string;
}

export interface IKnowledge {
  create_at: number;
  data: string;
  id?: number;
  name: string;
  update_at: number;
  update_user: string;
  /**
   * 页面类型，“firemap” 或 “dashboard”
   */
  target: IKnowledgeTarget;
  /**
   * target=firemap 时用这个，数据结构和其他灭火图树选择器一致
   */
  firemap?: IKnowledgeFiremap[];
  /**
   * target=dashboard 时用这个
   */
  dashboard?: IKnowledgeDashboard[];
}

export interface ISlo {
  workspace_id: number;
  // 以下三个 slo 详情页填写
  id?: number;
  start?: number;
  end?: number;
}

export interface ICustomMessageRenderer {
  response: IMessageResponse;
  isCancel?: boolean;
  maybeScrollToBottom?: () => void;
}
