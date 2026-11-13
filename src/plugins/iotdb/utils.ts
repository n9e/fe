import _ from 'lodash';

/**
 * Builds a series label from the metric name and its remaining labels.
 * Excludes __name__ from the label set because it is used as the name prefix.
 */
export const getSerieName = (metric: any) => {
  const metricName = metric?.__name__ || '';
  const labels = _.keys(metric)
    .filter((ml) => ml !== '__name__')
    .map((label) => {
      return `${label}="${metric[label]}"`;
    });

  return `${metricName}{${_.join(labels, ',')}}`;
};

type QueryKeys = {
  valueKey?: string | string[];
  metricKey?: string | string[];
};

/**
 * Joins array-based column names and trims whitespace from query keys.
 * Returns an empty string for missing or empty keys so callers can apply a fallback.
 */
const normalizeQueryKey = (value?: string | string[]) => {
  const normalized = Array.isArray(value) ? _.join(value, ' ') : value || '';
  return normalized.trim();
};

/**
 * Returns the configured value key and falls back to the legacy metric key.
 * Empty arrays and blank strings are treated as missing values.
 */
export const getValueKey = (keys?: QueryKeys) => {
  return normalizeQueryKey(keys?.valueKey) || normalizeQueryKey(keys?.metricKey);
};
