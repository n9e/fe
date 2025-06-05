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
export const DOC_MAP = {
  relabel: '/docs/alert-event-relabel',
  callback: '/docs/alert-event-callback',
  event_update: '/docs/alert-event-update',
  event_drop: '/docs/alert-event-drop',
  label_enrich: '/docs/alert-event-label-enrich',
};
