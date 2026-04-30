export const NS = 'event-pipelines';
export const PERM = `/${NS}`;
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
  relabel: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/notification/processor-event-relabel/',
  event_drop: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/notification/processor-event-drop/',
  event_update: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/notification/processor-event-update/',
  callback: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/notification/processor-callback/',
  ai_summary: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/notification/processor-ai-summary/',
};
