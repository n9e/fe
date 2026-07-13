import React from 'react';
import _ from 'lodash';

import LogFieldValue from '@/pages/logExplorer/components/LogsViewer/components/LogFieldValue';
import { FieldValueType } from '@/pages/logExplorer/components/LogsViewer/types';

export default function renderLogViewerFieldValueWithoutFilters(
  key: string,
  value: any,
  context: {
    rawValue: Record<string, any>;
    highlight?: { [index: string]: string[] };
    renderScene?: 'raw' | 'logViewer';
  },
) {
  if (context.renderScene !== 'logViewer') return false;

  const displayValue = _.isPlainObject(value) || _.isArray(value) ? JSON.stringify(value) : value;

  return <LogFieldValue name={key} value={displayValue as FieldValueType} rawValue={context.rawValue} highlight={context.highlight} fieldValueClassName='whitespace-pre-wrap' />;
}
