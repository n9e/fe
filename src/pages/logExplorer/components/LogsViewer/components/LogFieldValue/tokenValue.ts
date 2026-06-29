import moment from 'moment';

import { FieldValueType } from '../../types';
import { toString } from './util';

interface TokenFieldFormatMap {
  type?: string;
  params?: {
    pattern?: string;
    urlTemplate?: string;
    labelTemplate?: string;
  };
}

interface TokenFieldAttr {
  field: string;
  formatMap?: TokenFieldFormatMap;
}

interface TokenFieldConfig {
  arr?: TokenFieldAttr[];
}

interface GetTokenDisplayValueParams {
  value: FieldValueType;
  fieldValue: FieldValueType;
  name: string;
  fieldConfig?: TokenFieldConfig;
}

export function getDateTokenDisplayValue(params: GetTokenDisplayValueParams): FieldValueType {
  const { value, fieldValue, name, fieldConfig } = params;

  let displayValue = value;
  const fieldAttr = fieldConfig?.arr?.find((i) => i.field === name);

  if (fieldAttr?.formatMap?.type === 'date' && fieldAttr?.formatMap?.params?.pattern && (typeof fieldValue === 'number' || typeof fieldValue === 'string')) {
    displayValue = moment(fieldValue).format(fieldAttr.formatMap.params.pattern);
  }

  return displayValue;
}

export function getTokenDisplayValue(params: GetTokenDisplayValueParams): FieldValueType {
  const { value, fieldValue, name, fieldConfig } = params;

  let displayValue = value;
  const fieldAttr = fieldConfig?.arr?.find((i) => i.field === name);

  if (fieldAttr?.formatMap?.type === 'date' && fieldAttr?.formatMap?.params?.pattern && (typeof fieldValue === 'number' || typeof fieldValue === 'string')) {
    displayValue = moment(fieldValue).format(fieldAttr.formatMap.params.pattern);
  }

  if (fieldAttr?.formatMap?.type === 'url' && fieldAttr?.formatMap?.params?.urlTemplate && fieldAttr?.formatMap?.params?.labelTemplate) {
    displayValue = fieldAttr.formatMap.params.labelTemplate.replace('{{value}}', toString(fieldValue));
  }

  return displayValue;
}

export function getHighlightSource(highlightKey: string, highlight?: Record<string, string[]>): string[] | undefined {
  const topLevelHighlightKey = highlightKey.split('.')[0];
  return highlight?.[highlightKey] || (topLevelHighlightKey !== highlightKey ? highlight?.[topLevelHighlightKey] : undefined);
}
