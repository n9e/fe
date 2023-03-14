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
  },
};
export default en_US;
