export const NS = 'event-pipelines';
export const PERM = `/${NS}`;
export const DOC_URL = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/';
// 列表筛选条件持久化到 sessionStorage，刷新后不丢失（与订阅规则一致）
export const FILTER_SESSION_STORAGE_KEY = 'event-pipelines-filter';
// 空状态与新建页共用的三类典型场景文案 key
export const SCENARIO_KEYS = ['denoise', 'enrich', 'dispatch'] as const;
// 与后端 event_pipeline.name 的 varchar(128) 对齐：自动命名与克隆命名都不能超过它
export const MAX_NAME_LENGTH = 128;
// 试跑样例事件的默认级别，与后端 buildPipelineTestMockEvent 的兜底值保持一致
export const MOCK_EVENT_DEFAULT_SEVERITY = 2;
// 后端 buildPipelineTestMockEvent 合成的标签，仅用于弹窗里预览「样例事件长什么样」。
// rulename 是本地化文案、由后端按语言生成，这里不重复展示，避免两边对不上。
export const MOCK_EVENT_TAGS = ['__name__=cpu_usage_idle', 'ident=mock-host-01', 'env=prod', 'service=web'];
// 处理器默认值：编辑器里的 Form.Item initialValue 必须引用下面这些常量，不能各写各的字面量。
// 否则卡片一挂载 config 就与「默认配置」不相等，切换类型时会误报「切换会清空当前配置」——
// 用户一个字没改也会被拦一次。
export const RELABEL_DEFAULT_SEPARATOR = ';';
export const CALLBACK_DEFAULT_TIMEOUT = 10000;
export const AI_SUMMARY_DEFAULT_TIMEOUT = 30000;
export const AI_SUMMARY_PROMPT_TEMPLATE_KEY = 'ai_summary.prompt_template_placeholder';
// 提示词模板是本地化文案，取值方式必须与 AISummary 编辑器里的 initialValue 完全一致
export const AI_SUMMARY_PROMPT_TEMPLATE_OPTIONS = { interpolation: { skipOnVariables: true } } as const;

/** 兼容 i18next 的 TFunction：它的返回类型是 string | TFunctionDetailedResult，不能收窄成 string */
type Translate = (key: string, options?: any) => unknown;

/**
 * 某个处理器类型「什么都没配」时的配置。
 * 既用于切换类型后填充新配置，也用于判断「用户是否改过」，所以必须是唯一来源。
 */
export const getDefaultProcessorConfig = (typ?: string, t?: Translate): Record<string, any> => {
  switch (typ) {
    case 'relabel':
      return { action: 'replace', separator: RELABEL_DEFAULT_SEPARATOR };
    case 'callback':
    case 'event_update':
      return { timeout: CALLBACK_DEFAULT_TIMEOUT };
    case 'ai_summary':
      return {
        timeout: AI_SUMMARY_DEFAULT_TIMEOUT,
        ...(t ? { prompt_template: t(AI_SUMMARY_PROMPT_TEMPLATE_KEY, AI_SUMMARY_PROMPT_TEMPLATE_OPTIONS) } : {}),
      };
    default:
      return {};
  }
};

// 新建工作流时先给一张空的处理器卡片：不预选类型，让用户从分组下拉里挑。
// 不预选 relabel 是因为它门槛最高（一屏 Prometheus relabel 英文字段），
// 也不预选 event_drop——它是破坏性的，预选会诱导用户建出静默丢告警的工作流。
export const DEFAULT_VALUES = {
  processors: [{}],
};

/**
 * 「事件丢弃」的一键示例片段。
 * 这些模板全部在真实后端（event-processor-tryrun）上跑通过：
 * $event.Severity 是数字 1/2/3，$event.IsRecovered 是布尔，$event.TagsMap.<标签名> 取标签值，
 * 多条件用 {{ if or (...) (...) }} / and 组合。改这里前请重新实测，别照着文档想当然。
 */
export const EVENT_DROP_SNIPPETS = [
  { key: 'severity', content: '{{ if eq $event.Severity 3 }}true{{ end }}' },
  { key: 'recovered', content: '{{ if $event.IsRecovered }}true{{ end }}' },
  { key: 'tag', content: '{{ if eq $event.TagsMap.env "dev" }}true{{ end }}' },
  { key: 'rule_name', content: '{{ if eq $event.RuleName "规则名" }}true{{ end }}' },
] as const;

export const documentPathMap = {
  relabel: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/processor-event-relabel/',
  event_drop: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/processor-event-drop/',
  event_update: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/processor-event-update/',
  callback: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/processor-callback/',
  ai_summary: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/processor-ai-summary/',
};
