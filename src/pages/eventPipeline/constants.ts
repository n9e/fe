export const NS = 'event-pipeline';
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
