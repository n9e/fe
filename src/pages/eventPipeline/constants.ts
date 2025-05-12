export const NS = 'event-pipelines';
export const PERM = `/${NS}`;
export const DEFAULT_VALUES = {
  processors: [
    {
      typ: 'relabel',
      config: {
        action: 'replace',
      },
    },
  ],
};
