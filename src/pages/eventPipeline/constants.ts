export const NS = 'event-pipelines';
export const PERM = `/${NS}`;
export const DOC_URL = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/';
// 列表筛选条件持久化到 sessionStorage，刷新后不丢失（与订阅规则一致）
export const FILTER_SESSION_STORAGE_KEY = 'event-pipelines-filter';
// 空状态与新建页共用的三类典型场景文案 key
export const SCENARIO_KEYS = ['denoise', 'enrich', 'dispatch'] as const;
// 与后端 event_pipeline.name 的 varchar(128) 对齐：自动命名与克隆命名都不能超过它
export const MAX_NAME_LENGTH = 128;
export const DEFAULT_PROCESSOR_CONFIG_MAP = {
  relabel: {
    action: 'replace',
  },
  callback: {
    timeout: 10000,
  },
  event_update: {
    timeout: 10000,
  },
};
export const DEFAULT_VALUES = {
  processors: [
    {
      typ: 'relabel',
      config: DEFAULT_PROCESSOR_CONFIG_MAP['relabel'],
    },
  ],
};

export const documentPathMap = {
  relabel: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/processor-event-relabel/',
  event_drop: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/processor-event-drop/',
  event_update: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/processor-event-update/',
  callback: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/processor-callback/',
  ai_summary: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/processor-ai-summary/',
};
