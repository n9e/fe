export interface HexbinRecord {
  name?: string;
  value?: string | number;
  metric?: Record<string, string | number | undefined>;
  target?: {
    legend?: string;
  };
}

export function getTooltipContent(record: HexbinRecord | undefined, valueField = 'Value') {
  const value = valueField !== 'Value' ? record?.metric?.[valueField] : record?.value;
  if (record?.target?.legend) {
    const name = record.name || record.metric?.__name__ || 'value';
    return `<div><strong>${name} ${value}</strong></div>`;
  }

  const metric = record?.metric;
  const metricName = metric?.__name__ || 'value';
  const metricNameRow = `<div><strong>${metricName}: ${value}</strong></div>`;
  const labelsRows = Object.entries(metric || {})
    .filter(([key]) => key !== '__name__')
    .map(([key, labelValue]) => `<div>${key}: ${labelValue}</div>`)
    .join('');

  return `${metricNameRow}${labelsRows}`;
}
