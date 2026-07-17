import { OnValueFilterParams } from '@/pages/logExplorer/components/LogsViewer/types';

import { isCKDateType } from '../../constants';
import { Field, FilterConfig } from '../types';

// Positive-text operators that BE PrepareHighlightTerms in
// plus/datasource/ck/highlight.go accepts. Kept in canonical form (see
// constants.ts) so the FE gate mirrors the BE contract exactly.
const HIGHLIGHTABLE_OPERATORS = new Set(['=', 'IN', 'LIKE', 'ILIKE', 'hasToken', 'match']);

// Map the LogsViewer token-menu intent (AND/NOT/EXISTS) directly to a CK
// operator. Negation lives entirely in the operator space (no `not` flag on
// the filter) so the QueryBuilder chip renders truthfully and the BE payload
// is unambiguous — see docs/ck-querybuilder-aggregate-golden-lessons-learned §K.
export function buildCKFilterFromLogValue(params: OnValueFilterParams, indexData: Field[]): FilterConfig | undefined {
  if (!indexData.some((item) => item.field === params.key)) return undefined;

  const intent = params.operator.toUpperCase();
  let operator: string;
  if (intent === 'EXISTS') {
    // Token menu "field exists" — always IS NOT NULL regardless of the
    // triggering value.
    operator = 'IS NOT NULL';
  } else if (intent === 'NOT') {
    operator = params.value === null ? 'IS NOT NULL' : '!=';
  } else {
    // 'AND' or unknown intent → positive filter
    operator = params.value === null ? 'IS NULL' : '=';
  }

  return {
    logic: 'and',
    field: params.key,
    operator,
    value: params.value,
  };
}

export function hasHighlightableFilter(filters: FilterConfig[] = []): boolean {
  return filters.some((filter) => {
    if (filter.disabled) return false;
    const operator = filter.operator || '';
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
