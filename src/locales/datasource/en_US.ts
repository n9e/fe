const en_US = {
  es: {
    index: 'Index',
    index_tip: `
      Support for multiple configuration methods:
      <br />
      1. Specify a single index 'gb' to search all documents in the 'gb' index
      <br />
      2. Specify multiple indexes 'gb, us' to search all documents in the 'gb' and 'us' indexes
      <br />
      3. Specify index prefixes 'g*, u*' to search all documents in any index starting with 'g' or 'u'
      <br />
      `,
    index_msg: 'Index is required',
    filter: 'Filter',
    time_label: 'Time',
    date_field: 'Date Field',
    date_field_msg: 'Date Field is required',
    interval: 'Interval',
    value: 'Metric',
    terms: {
      more: 'More',
      size: 'Size',
      min_value: 'Min Doc Count',
    },
    raw: {
      limit: 'Limit',
    },
    alert: {
      query: {
        title: 'Queries',
        preview: 'Preview',
      },
      trigger: {
        title: 'Trigger',
        builder: 'Builder',
        code: 'Code',
        label: 'Label',
      },
      prom_eval_interval_tip: 'Every {{num}} seconds, to query the backend storage',
      prom_for_duration_tip:
        'Usually the duration is greater than the execution frequency. During the duration, PromQL query is executed multiple times according to the execution frequency, and an alert is generated only if it is triggered every time. If the duration is set to 0, an alert is generated as long as the threshold is triggered once during the PromQL query.',
      advancedSettings: 'Advanced Settings',
      delay: 'Delay',
    },
  },
};
export default en_US;
