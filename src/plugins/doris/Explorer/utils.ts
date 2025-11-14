import _ from 'lodash';

export const getSerieName = (metric: any) => {
  const metricName = metric?.__name__ || '';
  const labels = _.keys(metric)
    .filter((ml) => ml !== '__name__')
    .map((label) => {
      return `${label}="${metric[label]}"`;
    });

  return `${metricName}{${_.join(labels, ',')}}`;
};

export const filteredFields = (fields: string[], organizeFields: string[]) => {
  return _.filter(fields, (item) => {
    if (_.includes(['__time', '__package_offset__', '___raw___', '___id___'], item)) {
      return false;
    }
    if (!_.isEmpty(organizeFields)) {
      return _.includes(organizeFields, item);
    }
    return true;
  });
};

export function getLocalstorageOptions(logsOptionsCacheKey: string) {
  const defaultOptions = {
    logMode: 'origin',
    lineBreak: 'false',
    reverse: 'true',
    jsonDisplaType: 'tree',
    jsonExpandLevel: 1,
    organizeFields: [],
    lines: 'true',
    time: 'true',
  };
  const options = localStorage.getItem(`${logsOptionsCacheKey}@options`);

  if (options) {
    try {
      return JSON.parse(options);
    } catch (e) {
      return defaultOptions;
    }
  }
  return defaultOptions;
}

export function setLocalstorageOptions(logsOptionsCacheKey, options) {
  localStorage.setItem(`${logsOptionsCacheKey}@options`, JSON.stringify(options));
}
