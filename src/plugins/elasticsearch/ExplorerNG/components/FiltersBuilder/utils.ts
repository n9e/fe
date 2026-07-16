import _ from 'lodash';

import { Filter } from '../../types';

export type ESFilterBuilderOperator = '=' | '!=' | 'exists';

export interface ESFilterBuilderValues {
  field?: string;
  operator?: ESFilterBuilderOperator;
  value?: string | number | boolean | null;
  disabled?: boolean;
}

export function toBuilderOperator(operator?: string): ESFilterBuilderOperator {
  if (operator === 'NOT') return '!=';
  if (operator === 'EXISTS') return 'exists';
  return '=';
}

export function toQueryFilter(values: ESFilterBuilderValues): Filter {
  const key = values.field || '';
  const operator = values.operator || '=';

  if (operator === 'exists') {
    return {
      key,
      value: '',
      operator: 'EXISTS',
      disabled: values.disabled || false,
    };
  }

  return {
    key,
    value: values.value as any,
    operator: operator === '!=' ? 'NOT' : 'AND',
    disabled: values.disabled || false,
  };
}

export function toBuilderValues(filter?: Filter): ESFilterBuilderValues {
  return {
    field: filter?.key,
    operator: toBuilderOperator(filter?.operator),
    value: filter?.operator === 'EXISTS' ? undefined : filter?.value,
    disabled: filter?.disabled || false,
  };
}

export function describeFilter(filter: Filter): string {
  if (filter.operator === 'EXISTS') {
    return `${filter.key} exists`;
  }
  return `${filter.operator === 'NOT' ? 'NOT ' : ''}${filter.key}: ${_.toString(filter.value)}`;
}
