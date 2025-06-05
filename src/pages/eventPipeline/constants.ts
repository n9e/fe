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
