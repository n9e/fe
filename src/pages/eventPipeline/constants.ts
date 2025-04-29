export const NS = 'event-pipeline';
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
