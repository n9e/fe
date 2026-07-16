import { OnValueFilterParams } from '@/pages/logExplorer/components/LogsViewer/types';

import { isCKDateType } from '../../constants';
import { Field, FilterConfig } from '../types';

// Positive-text operators that BE PrepareHighlightTerms in
// plus/datasource/ck/highlight.go accepts. Kept in canonical form (see
// constants.ts) so the FE gate mirrors the BE contract exactly.
const HIGHLIGHTABLE_OPERATORS = new Set(['=', 'IN', 'LIKE', 'ILIKE', 'hasToken', 'match']);

export function buildCKFilterFromLogValue(params: OnValueFilterParams, indexData: Field[]): FilterConfig | undefined {
  if (!indexData.some((item) => item.field === params.key)) return undefined;

  return {
    logic: 'and',
    field: params.key,
    operator: params.value === null ? 'IS NULL' : '=',
    value: params.value,
    not: params.operator.toUpperCase() === 'NOT',
  };
}

export function hasHighlightableFilter(filters: FilterConfig[] = []): boolean {
  return filters.some((filter) => {
    if (filter.disabled) return false;
    const operator = filter.operator || '';
    if (filter.not) return false;
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
