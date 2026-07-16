import { OnValueFilterParams } from '@/pages/logExplorer/components/LogsViewer/types';

import { isCKDateType } from '../../constants';
import { Field, FilterConfig } from '../types';

const HIGHLIGHTABLE_OPERATORS = new Set(['=', 'in', 'like', 'ilike', 'has_token', 'match']);

export function buildCKFilterFromLogValue(params: OnValueFilterParams, indexData: Field[]): FilterConfig | undefined {
  if (!indexData.some((item) => item.field === params.key)) return undefined;

  return {
    logic: 'and',
    field: params.key,
    operator: params.value === null ? 'is-null' : '=',
    value: params.value,
    not: params.operator.toUpperCase() === 'NOT',
  };
}

export function hasHighlightableFilter(filters: FilterConfig[] = []): boolean {
  return filters.some((filter) => {
    const operator = (filter.operator || '').toLowerCase();
    if (filter.not || operator.startsWith('not')) return false;
    if (!HIGHLIGHTABLE_OPERATORS.has(operator)) return false;
    const values = Array.isArray(filter.value) ? filter.value : [filter.value];
    return values.some((value) => typeof value === 'string' && value.length > 0);
  });
}

export function pickCKTimeField(fields: Field[]): Field | undefined {
  const dateFields = fields.filter((field) => isCKDateType(field.type, field.normalized_type));
  const preferredNames = ['time', 'timestamp', '@timestamp'];
  for (const name of preferredNames) {
    const matched = dateFields.find((field) => field.field.toLowerCase() === name);
    if (matched) return matched;
  }
  return dateFields[0];
}
