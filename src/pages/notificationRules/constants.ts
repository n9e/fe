export const NS = 'notification-rules';
export const DEFAULT_VALUES = {
  enabled: true,
  notify_configs: [
    {
      severities: [1, 2, 3],
      time_ranges: [
        {
          week: [0, 1, 2, 3, 4, 5, 6],
          start: '00:00',
          end: '00:00',
        },
      ],
    },
  ],
};
